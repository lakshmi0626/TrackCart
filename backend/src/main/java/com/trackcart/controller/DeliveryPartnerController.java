package com.trackcart.controller;

import com.trackcart.dto.DeliveryPartnerResponse;
import com.trackcart.dto.ShipmentResponse;
import com.trackcart.service.DeliveryPartnerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/delivery-partners")
@Tag(name = "Delivery Partners", description = "Delivery partner profiles, assignment queue, availability and live telemetry")
public class DeliveryPartnerController {

    private final DeliveryPartnerService deliveryPartnerService;

    public DeliveryPartnerController(DeliveryPartnerService deliveryPartnerService) {
        this.deliveryPartnerService = deliveryPartnerService;
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated delivery partner profile")
    public ResponseEntity<DeliveryPartnerResponse> getMyProfile() {
        return ResponseEntity.ok(deliveryPartnerService.getMyProfile());
    }

    @GetMapping("/my-assignments")
    @Operation(summary = "Get list of shipments assigned to current delivery partner")
    public ResponseEntity<List<ShipmentResponse>> getMyAssignments() {
        return ResponseEntity.ok(deliveryPartnerService.getMyAssignments());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin endpoint to list all registered delivery partners")
    public ResponseEntity<List<DeliveryPartnerResponse>> getAllPartners() {
        return ResponseEntity.ok(deliveryPartnerService.getAllPartners());
    }

    @PutMapping("/availability")
    @Operation(summary = "Toggle partner availability status")
    public ResponseEntity<DeliveryPartnerResponse> updateAvailability(@RequestBody Map<String, Boolean> body) {
        Boolean available = body.getOrDefault("isAvailable", true);
        return ResponseEntity.ok(deliveryPartnerService.updateAvailability(available));
    }

    @PutMapping("/location")
    @Operation(summary = "Update partner GPS coordinates for telemetry tracking")
    public ResponseEntity<DeliveryPartnerResponse> updateLocation(@RequestBody Map<String, Double> coords) {
        Double lat = coords.get("lat");
        Double lng = coords.get("lng");
        return ResponseEntity.ok(deliveryPartnerService.updateLocation(lat, lng));
    }
}
