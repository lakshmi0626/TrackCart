package com.trackcart.service;

import com.trackcart.dto.DeliveryPartnerResponse;
import com.trackcart.dto.ShipmentResponse;
import com.trackcart.exception.ResourceNotFoundException;
import com.trackcart.model.DeliveryPartner;
import com.trackcart.model.Shipment;
import com.trackcart.model.User;
import com.trackcart.repository.DeliveryPartnerRepository;
import com.trackcart.repository.ShipmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DeliveryPartnerService {

    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final ShipmentRepository shipmentRepository;
    private final AuthService authService;

    public DeliveryPartnerService(DeliveryPartnerRepository deliveryPartnerRepository,
                                  ShipmentRepository shipmentRepository,
                                  AuthService authService) {
        this.deliveryPartnerRepository = deliveryPartnerRepository;
        this.shipmentRepository = shipmentRepository;
        this.authService = authService;
    }

    public DeliveryPartnerResponse getMyProfile() {
        User user = authService.getCurrentUser();
        DeliveryPartner partner = deliveryPartnerRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("No delivery partner profile registered for user: " + user.getEmail()));
        return DeliveryPartnerResponse.fromEntity(partner);
    }

    public List<ShipmentResponse> getMyAssignments() {
        User user = authService.getCurrentUser();
        DeliveryPartner partner = deliveryPartnerRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("No delivery partner profile registered for user: " + user.getEmail()));

        List<Shipment> shipments = shipmentRepository.findByDeliveryPartnerOrderByEstimatedDeliveryDateAsc(partner);
        return shipments.stream()
                .map(ShipmentResponse::fromShipment)
                .collect(Collectors.toList());
    }

    public List<DeliveryPartnerResponse> getAllPartners() {
        return deliveryPartnerRepository.findAll().stream()
                .map(DeliveryPartnerResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public DeliveryPartnerResponse updateAvailability(Boolean isAvailable) {
        User user = authService.getCurrentUser();
        DeliveryPartner partner = deliveryPartnerRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("No delivery partner profile found"));

        partner.setIsAvailable(isAvailable);
        DeliveryPartner saved = deliveryPartnerRepository.save(partner);
        return DeliveryPartnerResponse.fromEntity(saved);
    }

    @Transactional
    public DeliveryPartnerResponse updateLocation(Double lat, Double lng) {
        User user = authService.getCurrentUser();
        DeliveryPartner partner = deliveryPartnerRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("No delivery partner profile found"));

        partner.setCurrentLat(lat);
        partner.setCurrentLng(lng);
        DeliveryPartner saved = deliveryPartnerRepository.save(partner);
        return DeliveryPartnerResponse.fromEntity(saved);
    }
}
