package com.trackcart.controller;

import com.trackcart.dto.ShipmentResponse;
import com.trackcart.dto.UpdateShipmentStatusRequest;
import com.trackcart.model.ShipmentStatus;
import com.trackcart.service.ShipmentTrackingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shipments")
@Tag(name = "Shipments & Tracking", description = "Intelligent tracking timeline, status updates, partner assignment, and delay detection")
public class ShipmentController {

    private final ShipmentTrackingService trackingService;

    public ShipmentController(ShipmentTrackingService trackingService) {
        this.trackingService = trackingService;
    }

    @GetMapping("/track/{trackingNumber}")
    @Operation(summary = "Public tracking lookup by tracking number or order number")
    public ResponseEntity<ShipmentResponse> trackShipment(@PathVariable String trackingNumber) {
        return ResponseEntity.ok(trackingService.trackByTrackingNumber(trackingNumber));
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get shipment details by Order ID")
    public ResponseEntity<ShipmentResponse> getShipmentByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(trackingService.getShipmentByOrderId(orderId));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin endpoint to list all shipments with status/delay filtering")
    public ResponseEntity<List<ShipmentResponse>> getAllShipments(
            @RequestParam(required = false) ShipmentStatus status,
            @RequestParam(required = false) Boolean delayed) {
        return ResponseEntity.ok(trackingService.getAllShipments(status, delayed));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update shipment milestone status and append tracking event")
    public ResponseEntity<ShipmentResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateShipmentStatusRequest request) {
        return ResponseEntity.ok(trackingService.updateStatus(id, request));
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin endpoint to assign delivery partner to a shipment")
    public ResponseEntity<ShipmentResponse> assignPartner(
            @PathVariable Long id,
            @RequestBody Map<String, Long> payload) {
        Long partnerId = payload.get("partnerId");
        return ResponseEntity.ok(trackingService.assignDeliveryPartner(id, partnerId));
    }
}
