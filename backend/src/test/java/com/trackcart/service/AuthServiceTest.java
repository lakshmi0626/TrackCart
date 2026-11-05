package com.trackcart.service;

import com.trackcart.dto.AuthRequest;
import com.trackcart.dto.AuthResponse;
import com.trackcart.dto.RegisterRequest;
import com.trackcart.exception.BadRequestException;
import com.trackcart.model.Customer;
import com.trackcart.model.Role;
import com.trackcart.model.User;
import com.trackcart.repository.CustomerRepository;
import com.trackcart.repository.DeliveryPartnerRepository;
import com.trackcart.repository.UserRepository;
import com.trackcart.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private DeliveryPartnerRepository deliveryPartnerRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtTokenProvider tokenProvider;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                customerRepository,
                deliveryPartnerRepository,
                passwordEncoder,
                authenticationManager,
                tokenProvider
        );
    }

    @Test
    void registerCustomer_success() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("newuser@example.com");
        req.setPassword("Password@123");
        req.setFullName("New User");
        req.setRole(Role.CUSTOMER);
        req.setCity("Seattle");

        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashed_password");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(10L);
            return u;
        });
        when(tokenProvider.generateTokenFromUsername("newuser@example.com")).thenReturn("mock-jwt-token");

        AuthResponse res = authService.register(req);

        assertNotNull(res);
        assertEquals("newuser@example.com", res.getEmail());
        assertEquals("mock-jwt-token", res.getToken());
        assertEquals(Role.CUSTOMER, res.getRole());
        verify(customerRepository, times(1)).save(any(Customer.class));
    }

    @Test
    void register_duplicateEmail_throwsBadRequest() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("existing@example.com");

        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(req));
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_success() {
        AuthRequest req = new AuthRequest("user@example.com", "Password@123");
        Authentication mockAuth = mock(Authentication.class);
        User mockUser = new User("user@example.com", "hashed", "Test User", "+1234", Role.CUSTOMER);
        mockUser.setId(5L);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(mockAuth);
        when(tokenProvider.generateToken(mockAuth)).thenReturn("generated-jwt");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));

        AuthResponse res = authService.login(req);

        assertNotNull(res);
        assertEquals("generated-jwt", res.getToken());
        assertEquals("Test User", res.getFullName());
    }
}
