package com.trackcart.service;

import com.trackcart.dto.AuthRequest;
import com.trackcart.dto.AuthResponse;
import com.trackcart.dto.RegisterRequest;
import com.trackcart.exception.BadRequestException;
import com.trackcart.model.*;
import com.trackcart.repository.CustomerRepository;
import com.trackcart.repository.DeliveryPartnerRepository;
import com.trackcart.repository.UserRepository;
import com.trackcart.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       CustomerRepository customerRepository,
                       DeliveryPartnerRepository deliveryPartnerRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.deliveryPartnerRepository = deliveryPartnerRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        Role role = request.getRole() != null ? request.getRole() : Role.CUSTOMER;

        User user = new User(
                request.getEmail().toLowerCase(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName(),
                request.getPhone(),
                role
        );
        User savedUser = userRepository.save(user);

        if (role == Role.CUSTOMER) {
            Customer customer = new Customer(
                    savedUser,
                    request.getShippingAddress() != null ? request.getShippingAddress() : "742 Evergreen Terrace",
                    request.getCity() != null ? request.getCity() : "Springfield",
                    request.getState() != null ? request.getState() : "IL",
                    request.getPostalCode() != null ? request.getPostalCode() : "62704",
                    "India"
            );
            customerRepository.save(customer);
        } else if (role == Role.DELIVERY_PARTNER) {
            DeliveryPartner partner = new DeliveryPartner(
                    savedUser,
                    request.getVehicleType() != null ? request.getVehicleType() : "Electric Van",
                    request.getVehicleNumber() != null ? request.getVehicleNumber() : "KA-01-EV-2026",
                    request.getLicenseNumber() != null ? request.getLicenseNumber() : "DL-TC-998822"
            );
            deliveryPartnerRepository.save(partner);
        }

        String token = tokenProvider.generateTokenFromUsername(savedUser.getEmail());
        return new AuthResponse(token, savedUser.getId(), savedUser.getEmail(), savedUser.getFullName(), savedUser.getPhone(), savedUser.getRole());
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new BadRequestException("User not found"));

        return new AuthResponse(token, user.getId(), user.getEmail(), user.getFullName(), user.getPhone(), user.getRole());
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("No authenticated user found");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User profile not found for email: " + email));
    }
}
