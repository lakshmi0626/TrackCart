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
                            s != null ? s.getStatus().name() : null,
                            s != null && Boolean.TRUE.equals(s.getIsDelayed())
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
        res.setOrderStatusDistribution(dist);
        res.setRecentOrders(recentOrders);

        return res;
    }

    public PartnerAnalyticsResponse getPartnerSummary() {
        User user = authService.getCurrentAuthenticatedUser();
        DeliveryPartner partner = deliveryPartnerRepository.findByUser(user)
                .orElse(null);

        if (partner == null) {
            return new PartnerAnalyticsResponse(0L, 0L, 5.0, BigDecimal.ZERO, true);
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

    public String generateOrdersCsv() {
        StringBuilder csv = new StringBuilder();
        csv.append("Order Number,Customer Name,Date,Status,Total Amount,Payment Status,Items Count\n");
        List<Order> orders = orderRepository.findAll();
        for (Order o : orders) {
            String customerName = o.getCustomer() != null && o.getCustomer().getUser() != null ? o.getCustomer().getUser().getFullName() : "N/A";
            csv.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%d\n",
                    o.getOrderNumber(),
                    customerName.replace("\"", "\"\""),
                    o.getCreatedAt() != null ? o.getCreatedAt().toString() : "",
                    o.getStatus() != null ? o.getStatus().name() : "",
                    o.getTotalAmount() != null ? o.getTotalAmount().toString() : "0.00",
                    o.getPaymentStatus() != null ? o.getPaymentStatus().name() : "",
                    o.getItems() != null ? o.getItems().size() : 0
            ));
        }
        return csv.toString();
    }
}
