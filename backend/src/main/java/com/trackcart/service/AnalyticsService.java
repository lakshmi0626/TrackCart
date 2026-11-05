package com.trackcart.service;

import com.trackcart.dto.AdminAnalyticsResponse;
import com.trackcart.dto.OrderResponse;
import com.trackcart.dto.PartnerAnalyticsResponse;
import com.trackcart.model.*;
import com.trackcart.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final ShipmentRepository shipmentRepository;
    private final ComplaintRepository complaintRepository;
    private final AuditLogRepository auditLogRepository;
    private final AuthService authService;

    public AnalyticsService(OrderRepository orderRepository,
                            CustomerRepository customerRepository,
                            DeliveryPartnerRepository deliveryPartnerRepository,
                            ShipmentRepository shipmentRepository,
                            ComplaintRepository complaintRepository,
                            AuditLogRepository auditLogRepository,
                            AuthService authService) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.deliveryPartnerRepository = deliveryPartnerRepository;
        this.shipmentRepository = shipmentRepository;
        this.complaintRepository = complaintRepository;
        this.auditLogRepository = auditLogRepository;
        this.authService = authService;
    }

    public AdminAnalyticsResponse getAdminSummary() {
        AdminAnalyticsResponse res = new AdminAnalyticsResponse();

        long totalOrders = orderRepository.count();
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();
        long totalCustomers = customerRepository.count();
        long totalPartners = deliveryPartnerRepository.count();

        long deliveredOrders = shipmentRepository.countByStatus(ShipmentStatus.DELIVERED);
        long delayedOrders = shipmentRepository.countByIsDelayedTrue();
        long openComplaints = complaintRepository.countByStatus(ComplaintStatus.OPEN) + complaintRepository.countByStatus(ComplaintStatus.INVESTIGATING);

        long pendingDeliveries = totalOrders - deliveredOrders - orderRepository.countByStatus(OrderStatus.CANCELLED);
        if (pendingDeliveries < 0) pendingDeliveries = 0;

        Map<String, Long> dist = new HashMap<>();
        for (OrderStatus st : OrderStatus.values()) {
            dist.put(st.name(), orderRepository.countByStatus(st));
        }

        List<OrderResponse> recentOrders = orderRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(8)
                .map(o -> {
                    Shipment s = shipmentRepository.findByOrder(o).orElse(null);
                    return OrderResponse.fromOrder(
                            o,
                            s != null ? s.getTrackingNumber() : null,
                            s != null ? s.getStatus().name() : o.getStatus().name(),
                            s != null && s.getDeliveryPartner() != null && s.getDeliveryPartner().getUser() != null ? s.getDeliveryPartner().getUser().getFullName() : null,
                            s != null && s.getDeliveryPartner() != null && s.getDeliveryPartner().getUser() != null ? s.getDeliveryPartner().getUser().getPhone() : null
                    );
                })
                .collect(Collectors.toList());

        res.setTotalOrders(totalOrders);
        res.setTotalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        res.setTotalCustomers(totalCustomers);
        res.setTotalDeliveryPartners(totalPartners);
        res.setPendingDeliveries(pendingDeliveries);
        res.setDeliveredOrders(deliveredOrders);
        res.setDelayedOrders(delayedOrders);
        res.setOpenComplaints(openComplaints);
        res.setStatusDistribution(dist);
        res.setRecentOrders(recentOrders);

        return res;
    }

    public PartnerAnalyticsResponse getPartnerSummary() {
        User user = authService.getCurrentUser();
        DeliveryPartner partner = deliveryPartnerRepository.findByUser(user).orElse(null);

        if (partner == null) {
            return new PartnerAnalyticsResponse(0, 0, 5.0, BigDecimal.ZERO, true);
        }

        List<Shipment> assignments = shipmentRepository.findByDeliveryPartnerOrderByEstimatedDeliveryDateAsc(partner);
        long activeCount = assignments.stream()
                .filter(s -> s.getStatus() != ShipmentStatus.DELIVERED && s.getStatus() != ShipmentStatus.FAILED)
                .count();

        long completedCount = partner.getCompletedDeliveries();
        BigDecimal earnings = BigDecimal.valueOf(completedCount).multiply(new BigDecimal("15.50"));

        return new PartnerAnalyticsResponse(
                activeCount,
                completedCount,
                partner.getRating(),
                earnings,
                Boolean.TRUE.equals(partner.getIsAvailable())
        );
    }

    public List<AuditLog> getAuditLogs() {
        return auditLogRepository.findTop50ByOrderByTimestampDesc();
    }
}
