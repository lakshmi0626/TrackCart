package com.trackcart.service;

import com.trackcart.dto.CreateOrderRequest;
import com.trackcart.dto.OrderItemRequest;
import com.trackcart.dto.OrderResponse;
import com.trackcart.exception.BadRequestException;
import com.trackcart.exception.ResourceNotFoundException;
import com.trackcart.model.*;
import com.trackcart.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ShipmentRepository shipmentRepository;
    private final TrackingEventRepository trackingEventRepository;
    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final AuthService authService;

    public OrderService(OrderRepository orderRepository,
                        CustomerRepository customerRepository,
                        ShipmentRepository shipmentRepository,
                        TrackingEventRepository trackingEventRepository,
                        PaymentRepository paymentRepository,
                        InvoiceRepository invoiceRepository,
                        NotificationRepository notificationRepository,
                        AuditLogRepository auditLogRepository,
                        AuthService authService) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.shipmentRepository = shipmentRepository;
        this.trackingEventRepository = trackingEventRepository;
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogRepository = auditLogRepository;
        this.authService = authService;
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        User currentUser = authService.getCurrentUser();
        Customer customer = customerRepository.findByUser(currentUser)
                .orElseGet(() -> {
                    Customer newCustomer = new Customer(
                            currentUser,
                            request.getShippingAddress(),
                            request.getCity(),
                            request.getState(),
                            request.getPostalCode(),
                            "India"
                    );
                    return customerRepository.save(newCustomer);
                });

        Order order = new Order();
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        order.setOrderNumber("TC-ORD-" + uniqueSuffix);
        order.setCustomer(customer);
        order.setShippingAddress(request.getShippingAddress());
        order.setCity(request.getCity());
        order.setState(request.getState());
        order.setPostalCode(request.getPostalCode());
        order.setDeliveryNotes(request.getDeliveryNotes());
        order.setStatus(OrderStatus.CONFIRMED);
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setCreatedAt(Instant.now());
        order.setUpdatedAt(Instant.now());
        order.setEstimatedDeliveryDate(Instant.now().plus(3, ChronoUnit.DAYS));

        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderItemRequest itemReq : request.getItems()) {
            BigDecimal lineTotal = itemReq.getUnitPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            subtotal = subtotal.add(lineTotal);

            OrderItem item = new OrderItem(
                    itemReq.getProductName(),
                    itemReq.getSku() != null ? itemReq.getSku() : "SKU-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase(),
                    itemReq.getUnitPrice(),
                    itemReq.getQuantity(),
                    lineTotal,
                    itemReq.getImageUrl()
            );
            order.addItem(item);
        }

        BigDecimal shippingFee = subtotal.compareTo(new BigDecimal("100.00")) >= 0 ? BigDecimal.ZERO : new BigDecimal("12.00");
        BigDecimal tax = subtotal.multiply(new BigDecimal("0.18")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal finalAmount = subtotal.add(shippingFee).add(tax);

        order.setTotalAmount(subtotal);
        order.setShippingFee(shippingFee);
        order.setTaxAmount(tax);
        order.setFinalAmount(finalAmount);

        Order savedOrder = orderRepository.save(order);

        // 1. Create Payment
        Payment payment = new Payment(
                "TXN-" + uniqueSuffix,
                savedOrder,
                finalAmount,
                request.getPaymentMethod() != null ? request.getPaymentMethod() : "CREDIT_CARD",
                "SUCCESS"
        );
        paymentRepository.save(payment);

        // 2. Create Invoice
        Invoice invoice = new Invoice(
                "INV-" + uniqueSuffix,
                savedOrder,
                finalAmount,
                tax,
                "/api/orders/" + savedOrder.getId() + "/invoice"
        );
        invoiceRepository.save(invoice);

        // 3. Create Shipment & Tracking
        Shipment shipment = new Shipment();
        String trackingNum = "TRK-TC-" + uniqueSuffix;
        shipment.setTrackingNumber(trackingNum);
        shipment.setOrder(savedOrder);
        shipment.setStatus(ShipmentStatus.CONFIRMED);
        shipment.setCarrierName("TrackCart Express");
        shipment.setEstimatedDeliveryDate(savedOrder.getEstimatedDeliveryDate());
        shipment.setIsDelayed(false);
        Shipment savedShipment = shipmentRepository.save(shipment);

        // First timeline event: ORDER PLACED
        TrackingEvent eventPlaced = new TrackingEvent(
                ShipmentStatus.MANIFESTED,
                request.getCity(),
                "Order placed successfully by customer and payment authorized.",
                "CUSTOMER",
                Instant.now().minus(2, ChronoUnit.MINUTES)
        );
        savedShipment.addEvent(eventPlaced);

        // Second timeline event: CONFIRMED
        TrackingEvent eventConfirmed = new TrackingEvent(
                ShipmentStatus.CONFIRMED,
                "Fulfillment Central Hub",
                "Order verified by inventory management. Routing to packing warehouse.",
                "SYSTEM",
                Instant.now()
        );
        savedShipment.addEvent(eventConfirmed);
        trackingEventRepository.save(eventPlaced);
        trackingEventRepository.save(eventConfirmed);

        // 4. Create Notification
        Notification notif = new Notification(
                currentUser,
                "Order Confirmed: " + savedOrder.getOrderNumber(),
                "Your order has been verified. Tracking Number: " + trackingNum,
                NotificationType.ORDER
        );
        notificationRepository.save(notif);

        // 5. Audit Log
        AuditLog audit = new AuditLog(
                "ORDER_CREATED",
                "Order",
                savedOrder.getId().toString(),
                currentUser.getEmail(),
                "Created order " + savedOrder.getOrderNumber() + " with total $" + finalAmount
        );
        auditLogRepository.save(audit);

        return OrderResponse.fromOrder(savedOrder, trackingNum, savedShipment.getStatus().name(), null, null);
    }

    public List<OrderResponse> getOrdersForCurrentUser() {
        User user = authService.getCurrentUser();
        List<Order> orders;

        if (user.getRole() == Role.ADMIN) {
            orders = orderRepository.findAll();
        } else if (user.getRole() == Role.CUSTOMER) {
            Customer customer = customerRepository.findByUser(user)
                    .orElse(null);
            if (customer == null) {
                return List.of();
            }
            orders = orderRepository.findByCustomerOrderByCreatedAtDesc(customer);
        } else if (user.getRole() == Role.DELIVERY_PARTNER) {
            DeliveryPartner partner = customerRepository.findByUser(user)
                    .map(c -> (DeliveryPartner) null)
                    .orElse(null);
            // handled in delivery partner service
            orders = orderRepository.findAll();
        } else {
            orders = List.of();
        }

        return orders.stream().map(o -> {
            Shipment s = shipmentRepository.findByOrder(o).orElse(null);
            String trk = s != null ? s.getTrackingNumber() : null;
            String status = s != null ? s.getStatus().name() : o.getStatus().name();
            String partnerName = (s != null && s.getDeliveryPartner() != null && s.getDeliveryPartner().getUser() != null)
                    ? s.getDeliveryPartner().getUser().getFullName() : null;
            String partnerPhone = (s != null && s.getDeliveryPartner() != null && s.getDeliveryPartner().getUser() != null)
                    ? s.getDeliveryPartner().getUser().getPhone() : null;
            return OrderResponse.fromOrder(o, trk, status, partnerName, partnerPhone);
        }).collect(Collectors.toList());
    }

    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        Shipment s = shipmentRepository.findByOrder(order).orElse(null);
        String trk = s != null ? s.getTrackingNumber() : null;
        String status = s != null ? s.getStatus().name() : order.getStatus().name();
        String partnerName = (s != null && s.getDeliveryPartner() != null && s.getDeliveryPartner().getUser() != null)
                ? s.getDeliveryPartner().getUser().getFullName() : null;
        String partnerPhone = (s != null && s.getDeliveryPartner() != null && s.getDeliveryPartner().getUser() != null)
                ? s.getDeliveryPartner().getUser().getPhone() : null;

        return OrderResponse.fromOrder(order, trk, status, partnerName, partnerPhone);
    }

    @Transactional
    public OrderResponse cancelOrder(Long id, String reason) {
        User user = authService.getCurrentUser();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        if (order.getStatus() == OrderStatus.SHIPPED ||
            order.getStatus() == OrderStatus.OUT_FOR_DELIVERY ||
            order.getStatus() == OrderStatus.DELIVERED) {
            throw new BadRequestException("Order cannot be cancelled because it is already in status: " + order.getStatus());
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Order is already cancelled.");
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setPaymentStatus(PaymentStatus.REFUNDED);
        order.setUpdatedAt(Instant.now());
        Order updated = orderRepository.save(order);

        Shipment shipment = shipmentRepository.findByOrder(order).orElse(null);
        if (shipment != null) {
            shipment.setStatus(ShipmentStatus.FAILED);
            TrackingEvent cancelEvent = new TrackingEvent(
                    ShipmentStatus.FAILED,
                    "Customer Service",
                    "Order cancelled by customer. Reason: " + (reason != null ? reason : "Customer request") + ". Full refund initiated.",
                    user.getRole().name()
            );
            shipment.addEvent(cancelEvent);
            trackingEventRepository.save(cancelEvent);
            shipmentRepository.save(shipment);
        }

        Notification notification = new Notification(
                order.getCustomer().getUser(),
                "Order Cancelled: " + order.getOrderNumber(),
                "Your order has been cancelled and refund has been initiated to your original payment method.",
                NotificationType.ORDER
        );
        notificationRepository.save(notification);

        AuditLog audit = new AuditLog(
                "ORDER_CANCELLED",
                "Order",
                order.getId().toString(),
                user.getEmail(),
                "Cancelled order " + order.getOrderNumber()
        );
        auditLogRepository.save(audit);

        return OrderResponse.fromOrder(updated, shipment != null ? shipment.getTrackingNumber() : null, "CANCELLED", null, null);
    }
}
