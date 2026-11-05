package com.trackcart.service;

import com.trackcart.dto.ShipmentResponse;
import com.trackcart.dto.UpdateShipmentStatusRequest;
import com.trackcart.exception.ResourceNotFoundException;
import com.trackcart.model.*;
import com.trackcart.repository.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShipmentTrackingService {

    private final ShipmentRepository shipmentRepository;
    private final OrderRepository orderRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final TrackingEventRepository trackingEventRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final AuthService authService;
    private final EmailService emailService;
    private final SmsWebhookService smsWebhookService;

    public ShipmentTrackingService(ShipmentRepository shipmentRepository,
                                   OrderRepository orderRepository,
                                   DeliveryPartnerRepository deliveryPartnerRepository,
                                   TrackingEventRepository trackingEventRepository,
                                   NotificationRepository notificationRepository,
                                   AuditLogRepository auditLogRepository,
                                   AuthService authService, EmailService emailService, SmsWebhookService smsWebhookService) {
        this.shipmentRepository = shipmentRepository;
        this.orderRepository = orderRepository;
        this.deliveryPartnerRepository = deliveryPartnerRepository;
        this.trackingEventRepository = trackingEventRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogRepository = auditLogRepository;
        this.authService = authService;
        this.emailService = emailService;
        this.smsWebhookService = smsWebhookService;
    }

    public ShipmentResponse trackByTrackingNumber(String trackingNumber) {
        Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseGet(() -> orderRepository.findByOrderNumber(trackingNumber)
                        .flatMap(shipmentRepository::findByOrder)
                        .orElseThrow(() -> new ResourceNotFoundException("No shipment found matching tracking number or order number: " + trackingNumber)));

        checkAndApplyDelayStatus(shipment);
        return ShipmentResponse.fromShipment(shipment);
    }

    public ShipmentResponse getShipmentByOrderId(Long orderId) {
        Shipment shipment = shipmentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("No shipment found for order id: " + orderId));
        checkAndApplyDelayStatus(shipment);
        return ShipmentResponse.fromShipment(shipment);
    }

    public List<ShipmentResponse> getAllShipments(ShipmentStatus status, Boolean isDelayed) {
        List<Shipment> list;
        if (Boolean.TRUE.equals(isDelayed)) {
            list = shipmentRepository.findByIsDelayedTrue();
        } else if (status != null) {
            list = shipmentRepository.findByStatus(status);
        } else {
            list = shipmentRepository.findAll();
        }

        return list.stream()
                .peek(this::checkAndApplyDelayStatus)
                .map(ShipmentResponse::fromShipment)
                .collect(Collectors.toList());
    }

    @Transactional
    public ShipmentResponse updateStatus(Long shipmentId, UpdateShipmentStatusRequest request) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with id: " + shipmentId));

        User currentUser = authService.getCurrentUser();
        ShipmentStatus newStatus = request.getStatus();
        shipment.setStatus(newStatus);

        if (Boolean.TRUE.equals(request.getIsDelayed())) {
            shipment.setIsDelayed(true);
            if (request.getDelayReason() != null) {
                shipment.setDelayReason(request.getDelayReason());
            }
        }

        Instant now = Instant.now();
        String loc = request.getLocation() != null ? request.getLocation() : "Transit Facility";
        String desc = request.getDescription();

        if (newStatus == ShipmentStatus.PICKED_UP) {
            shipment.setPickupTime(now);
            if (desc == null) desc = "Package picked up by delivery partner.";
        } else if (newStatus == ShipmentStatus.PACKED) {
            if (desc == null) desc = "Package sealed, labeled, and staged for dispatch.";
        } else if (newStatus == ShipmentStatus.SHIPPED || newStatus == ShipmentStatus.IN_TRANSIT) {
            if (desc == null) desc = "Package in transit through logistics network.";
            if (shipment.getOrder() != null) {
                shipment.getOrder().setStatus(OrderStatus.SHIPPED);
                orderRepository.save(shipment.getOrder());
            }
        } else if (newStatus == ShipmentStatus.OUT_FOR_DELIVERY) {
            if (desc == null) desc = "Package is out for delivery with courier.";
            if (shipment.getOrder() != null) {
                shipment.getOrder().setStatus(OrderStatus.OUT_FOR_DELIVERY);
                orderRepository.save(shipment.getOrder());
            }
        } else if (newStatus == ShipmentStatus.DELIVERED) {
            shipment.setDeliveredTime(now);
            shipment.setIsDelayed(false);
            if (desc == null) desc = "Package delivered successfully to recipient.";
            if (shipment.getOrder() != null) {
                shipment.getOrder().setStatus(OrderStatus.DELIVERED);
                orderRepository.save(shipment.getOrder());
            }
            if (shipment.getDeliveryPartner() != null) {
                DeliveryPartner dp = shipment.getDeliveryPartner();
                dp.setCompletedDeliveries(dp.getCompletedDeliveries() + 1);
                dp.setIsAvailable(true);
                deliveryPartnerRepository.save(dp);
            }
        } else if (newStatus == ShipmentStatus.DELAYED) {
            shipment.setIsDelayed(true);
            if (desc == null) desc = "Shipment delayed: " + (request.getDelayReason() != null ? request.getDelayReason() : "Operational bottleneck");
        }

        TrackingEvent event = new TrackingEvent(newStatus, loc, desc, currentUser.getRole().name(), now);
        shipment.addEvent(event);
        trackingEventRepository.save(event);

        Shipment saved = shipmentRepository.save(shipment);

        // Notify customer
        if (saved.getOrder() != null && saved.getOrder().getCustomer() != null && saved.getOrder().getCustomer().getUser() != null) {
            Notification notification = new Notification(
                    saved.getOrder().getCustomer().getUser(),
                    "Shipment Update: " + saved.getTrackingNumber(),
                    "Status changed to " + newStatus.name() + ". " + desc,
                    NotificationType.SHIPMENT
            );
            notificationRepository.save(notification);
        }

        // Audit Log
        AuditLog audit = new AuditLog(
                "SHIPMENT_STATUS_UPDATE",
                "Shipment",
                saved.getId().toString(),
                currentUser.getEmail(),
                "Updated status to " + newStatus.name() + " at " + loc
        );
                auditLogRepository.save(audit);

        if (newStatus == ShipmentStatus.SHIPPED) {
            emailService.sendShipmentDispatchedEmail(saved);
        } else if (newStatus == ShipmentStatus.DELIVERED) {
            emailService.sendDeliveryCompletedEmail(saved);
        }

        return ShipmentResponse.fromShipment(saved);
    }

    @Transactional
    public ShipmentResponse assignDeliveryPartner(Long shipmentId, Long partnerId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with id: " + shipmentId));

        DeliveryPartner partner = deliveryPartnerRepository.findById(partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery partner not found with id: " + partnerId));

        shipment.setDeliveryPartner(partner);
        if (shipment.getStatus() == ShipmentStatus.MANIFESTED || shipment.getStatus() == ShipmentStatus.CONFIRMED) {
            shipment.setStatus(ShipmentStatus.PACKED);
        }

        TrackingEvent assignEvent = new TrackingEvent(
                ShipmentStatus.PACKED,
                "Hub Dispatch",
                "Assigned to delivery partner: " + partner.getUser().getFullName() + " (" + partner.getVehicleType() + ")",
                "ADMIN"
        );
        shipment.addEvent(assignEvent);
        trackingEventRepository.save(assignEvent);

        Shipment updated = shipmentRepository.save(shipment);

        // Notify partner
        Notification partnerNotif = new Notification(
                partner.getUser(),
                "New Delivery Assigned",
                "Order " + shipment.getOrder().getOrderNumber() + " assigned for delivery in " + shipment.getOrder().getCity(),
                NotificationType.SHIPMENT
        );
        notificationRepository.save(partnerNotif);

        return ShipmentResponse.fromShipment(updated);
    }

    private void checkAndApplyDelayStatus(Shipment shipment) {
        if (shipment.getStatus() != ShipmentStatus.DELIVERED &&
            shipment.getStatus() != ShipmentStatus.FAILED &&
            shipment.getEstimatedDeliveryDate() != null &&
            Instant.now().isAfter(shipment.getEstimatedDeliveryDate())) {
            if (!Boolean.TRUE.equals(shipment.getIsDelayed())) {
                shipment.setIsDelayed(true);
                if (shipment.getDelayReason() == null) {
                    shipment.setDelayReason("Transit delay: Shipment exceeded estimated delivery deadline.");
                }
                shipmentRepository.save(shipment);
            }
        }
    }

    @Scheduled(fixedRate = 300000) // check every 5 minutes
    @Transactional
    public void detectDelayedShipmentsAutomatically() {
        List<Shipment> activeShipments = shipmentRepository.findAll().stream()
                .filter(s -> s.getStatus() != ShipmentStatus.DELIVERED && s.getStatus() != ShipmentStatus.FAILED)
                .toList();

        for (Shipment s : activeShipments) {
            checkAndApplyDelayStatus(s);
        }
    }
}
