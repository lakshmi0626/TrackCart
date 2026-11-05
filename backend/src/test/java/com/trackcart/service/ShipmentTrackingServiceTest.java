package com.trackcart.service;

import com.trackcart.dto.ShipmentResponse;
import com.trackcart.dto.UpdateShipmentStatusRequest;
import com.trackcart.model.*;
import com.trackcart.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShipmentTrackingServiceTest {

    @Mock private ShipmentRepository shipmentRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private DeliveryPartnerRepository deliveryPartnerRepository;
    @Mock private TrackingEventRepository trackingEventRepository;
    @Mock private NotificationRepository notificationRepository;
    @Mock private AuditLogRepository auditLogRepository;
    @Mock private AuthService authService;
    @Mock private EmailService emailService;
    @Mock private SmsWebhookService smsWebhookService;

    private ShipmentTrackingService trackingService;

    @BeforeEach
    void setUp() {
        trackingService = new ShipmentTrackingService(
                shipmentRepository,
                orderRepository,
                deliveryPartnerRepository,
                trackingEventRepository,
                notificationRepository,
                auditLogRepository,
                authService,
                emailService,
                smsWebhookService
        );
    }

    @Test
    void trackByTrackingNumber_calculatesDelayWhenOverdue() {
        Shipment s = new Shipment();
        s.setId(1L);
        s.setTrackingNumber("TRK-TC-TEST01");
        s.setStatus(ShipmentStatus.IN_TRANSIT);
        s.setEstimatedDeliveryDate(Instant.now().minus(2, ChronoUnit.DAYS)); // in the past!
        s.setIsDelayed(false);

        when(shipmentRepository.findByTrackingNumber("TRK-TC-TEST01")).thenReturn(Optional.of(s));

        ShipmentResponse res = trackingService.trackByTrackingNumber("TRK-TC-TEST01");

        assertNotNull(res);
        assertTrue(res.getIsDelayed());
        assertEquals("TRK-TC-TEST01", res.getTrackingNumber());
        verify(shipmentRepository, atLeastOnce()).save(s);
    }

    @Test
    void updateStatus_delivered_updatesOrderAndPartnerCount() {
        User partnerUser = new User("partner@example.com", "pass", "Partner Joe", "+999", Role.DELIVERY_PARTNER);
        DeliveryPartner partner = new DeliveryPartner(partnerUser, "Van", "VAN-01", "LIC-01");
        partner.setCompletedDeliveries(5);

        Order order = new Order();
        order.setStatus(OrderStatus.OUT_FOR_DELIVERY);

        Shipment shipment = new Shipment();
        shipment.setId(22L);
        shipment.setStatus(ShipmentStatus.OUT_FOR_DELIVERY);
        shipment.setOrder(order);
        shipment.setDeliveryPartner(partner);

        when(shipmentRepository.findById(22L)).thenReturn(Optional.of(shipment));
        when(authService.getCurrentUser()).thenReturn(partnerUser);
        when(shipmentRepository.save(any(Shipment.class))).thenReturn(shipment);

        UpdateShipmentStatusRequest req = new UpdateShipmentStatusRequest();
        req.setStatus(ShipmentStatus.DELIVERED);
        req.setLocation("Front Porch");
        req.setDescription("Signed by recipient");

        ShipmentResponse res = trackingService.updateStatus(22L, req);

        assertNotNull(res);
        assertEquals(ShipmentStatus.DELIVERED, res.getStatus());
        assertEquals(OrderStatus.DELIVERED, order.getStatus());
        assertEquals(6, partner.getCompletedDeliveries());
        verify(deliveryPartnerRepository, times(1)).save(partner);
    }
}
