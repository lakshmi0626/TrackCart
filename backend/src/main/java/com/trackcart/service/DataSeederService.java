package com.trackcart.service;

import com.trackcart.model.*;
import com.trackcart.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class DataSeederService implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ShipmentRepository shipmentRepository;
    private final TrackingEventRepository trackingEventRepository;
    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final ComplaintRepository complaintRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeederService(UserRepository userRepository,
                             CustomerRepository customerRepository,
                             DeliveryPartnerRepository deliveryPartnerRepository,
                             OrderRepository orderRepository,
                             OrderItemRepository orderItemRepository,
                             ShipmentRepository shipmentRepository,
                             TrackingEventRepository trackingEventRepository,
                             PaymentRepository paymentRepository,
                             InvoiceRepository invoiceRepository,
                             ComplaintRepository complaintRepository,
                             NotificationRepository notificationRepository,
                             AuditLogRepository auditLogRepository,
                             PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.deliveryPartnerRepository = deliveryPartnerRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.shipmentRepository = shipmentRepository;
        this.trackingEventRepository = trackingEventRepository;
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
        this.complaintRepository = complaintRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            seedDatabase();
        }
    }

    @Transactional
    public void seedDatabase() {
        // Clear existing data cleanly if re-seeding
        trackingEventRepository.deleteAll();
        shipmentRepository.deleteAll();
        invoiceRepository.deleteAll();
        paymentRepository.deleteAll();
        complaintRepository.deleteAll();
        notificationRepository.deleteAll();
        auditLogRepository.deleteAll();
        orderItemRepository.deleteAll();
        orderRepository.deleteAll();
        customerRepository.deleteAll();
        deliveryPartnerRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Users
        User admin = new User("admin@trackcart.io", passwordEncoder.encode("Admin@123"), "System Administrator", "+1-800-555-0199", Role.ADMIN);
        User customer1 = new User("customer@trackcart.io", passwordEncoder.encode("Customer@123"), "John Doe", "+1-555-0143", Role.CUSTOMER);
        User customer2 = new User("sarah.jenkins@example.com", passwordEncoder.encode("Customer@123"), "Sarah Jenkins", "+1-555-0188", Role.CUSTOMER);
        User partner1 = new User("partner@trackcart.io", passwordEncoder.encode("Partner@123"), "Marcus Vance", "+1-555-0177", Role.DELIVERY_PARTNER);
        User partner2 = new User("alex.rodriguez@example.com", passwordEncoder.encode("Partner@123"), "Alex Rodriguez", "+1-555-0166", Role.DELIVERY_PARTNER);

        userRepository.saveAll(List.of(admin, customer1, customer2, partner1, partner2));

        // 2. Customers
        Customer cust1 = new Customer(customer1, "42 Tech Boulevard, Silicon Towers", "San Francisco", "CA", "94105", "USA");
        Customer cust2 = new Customer(customer2, "188 Orchard Avenue, Apt 4B", "Seattle", "WA", "98101", "USA");
        customerRepository.saveAll(List.of(cust1, cust2));

        // 3. Delivery Partners
        DeliveryPartner dp1 = new DeliveryPartner(partner1, "Electric Cargo Van", "EV-CA-8891", "DL-908122-A");
        dp1.setCurrentLat(37.7749);
        dp1.setCurrentLng(-122.4194);
        dp1.setRating(4.95);
        dp1.setCompletedDeliveries(42);

        DeliveryPartner dp2 = new DeliveryPartner(partner2, "Hybrid Urban Cruiser", "HY-WA-4412", "DL-334190-B");
        dp2.setCurrentLat(47.6062);
        dp2.setCurrentLng(-122.3321);
        dp2.setRating(4.88);
        dp2.setCompletedDeliveries(28);

        deliveryPartnerRepository.saveAll(List.of(dp1, dp2));

        // 4. Orders & Shipments
        // Order 1: Delivered
        createDemoOrder(cust1, dp1, "TC-ORD-2026-8812", "TRK-TC-DEMO01", OrderStatus.DELIVERED, ShipmentStatus.DELIVERED,
                "Sony WH-1000XM5 Wireless Headphones", new BigDecimal("349.99"), 1,
                "Anker 100W Fast Charger", new BigDecimal("49.99"), 1,
                Instant.now().minus(5, ChronoUnit.DAYS), Instant.now().minus(1, ChronoUnit.DAYS), false, null);

        // Order 2: Out for delivery
        createDemoOrder(cust1, dp1, "TC-ORD-2026-8813", "TRK-TC-DEMO02", OrderStatus.OUT_FOR_DELIVERY, ShipmentStatus.OUT_FOR_DELIVERY,
                "Logitech MX Master 3S Wireless Mouse", new BigDecimal("99.99"), 1,
                "Keychron Q1 Pro Mechanical Keyboard", new BigDecimal("199.00"), 1,
                Instant.now().minus(2, ChronoUnit.DAYS), Instant.now().plus(4, ChronoUnit.HOURS), false, null);

        // Order 3: In Transit / Shipped
        createDemoOrder(cust2, dp2, "TC-ORD-2026-8814", "TRK-TC-DEMO03", OrderStatus.SHIPPED, ShipmentStatus.IN_TRANSIT,
                "Apple iPad Air 11-inch M2", new BigDecimal("599.00"), 1,
                "Apple Pencil Pro", new BigDecimal("129.00"), 1,
                Instant.now().minus(1, ChronoUnit.DAYS), Instant.now().plus(2, ChronoUnit.DAYS), false, null);

        // Order 4: Confirmed / Packed
        createDemoOrder(cust1, null, "TC-ORD-2026-8815", "TRK-TC-DEMO04", OrderStatus.CONFIRMED, ShipmentStatus.PACKED,
                "Dell UltraSharp 27 4K Monitor", new BigDecimal("489.99"), 1,
                "Ergonomic Monitor Desk Arm", new BigDecimal("79.99"), 1,
                Instant.now().minus(4, ChronoUnit.HOURS), Instant.now().plus(3, ChronoUnit.DAYS), false, null);

        // Order 5: Delayed
        createDemoOrder(cust2, dp2, "TC-ORD-2026-8816", "TRK-TC-DEMO05", OrderStatus.SHIPPED, ShipmentStatus.DELAYED,
                "Bose QuietComfort Ultra Earbuds", new BigDecimal("299.00"), 1,
                "Protective Silicone Carrying Case", new BigDecimal("24.99"), 1,
                Instant.now().minus(4, ChronoUnit.DAYS), Instant.now().minus(1, ChronoUnit.DAYS), true,
                "Severe regional weather disturbance and road closure along Interstate 5.");

        // 5. Complaints
        Order order5 = orderRepository.findByOrderNumber("TC-ORD-2026-8816").orElse(null);
        Complaint comp1 = new Complaint();
        comp1.setTicketNumber("TKT-TC-9001");
        comp1.setCustomer(cust2);
        comp1.setOrder(order5);
        comp1.setSubject("Delivery overdue by 24 hours without updated ETA");
        comp1.setDescription("My package was supposed to arrive yesterday morning. The tracking status shows delayed but I need it before Friday for business travel.");
        comp1.setPriority(ComplaintPriority.HIGH);
        comp1.setStatus(ComplaintStatus.INVESTIGATING);
        comp1.setResolutionNotes("Logistics supervisor contacted dispatch team. Re-routed via express secondary carrier.");
        complaintRepository.save(comp1);

        Order order1 = orderRepository.findByOrderNumber("TC-ORD-2026-8812").orElse(null);
        Complaint comp2 = new Complaint();
        comp2.setTicketNumber("TKT-TC-9002");
        comp2.setCustomer(cust1);
        comp2.setOrder(order1);
        comp2.setSubject("Invoice requested with registered company GSTIN");
        comp2.setDescription("Please reissue tax invoice with corporate tax ID.");
        comp2.setPriority(ComplaintPriority.LOW);
        comp2.setStatus(ComplaintStatus.RESOLVED);
        comp2.setResolutionNotes("Corporate invoice amended and emailed to customer.");
        comp2.setResolvedAt(Instant.now().minus(6, ChronoUnit.HOURS));
        complaintRepository.save(comp2);

        // 6. Notifications
        notificationRepository.save(new Notification(customer1, "Delivery Completed!", "Order TC-ORD-2026-8812 was delivered safely to your address.", NotificationType.ORDER));
        notificationRepository.save(new Notification(customer1, "Driver Approaching", "Marcus Vance is 10 minutes away with order TC-ORD-2026-8813.", NotificationType.SHIPMENT));
        notificationRepository.save(new Notification(customer2, "Weather Delay Alert", "Order TC-ORD-2026-8816 has encountered transit delay due to road closures.", NotificationType.SHIPMENT));

        // 7. Audit Logs
        auditLogRepository.save(new AuditLog("SEED_DATA", "System", "1", "system@trackcart.io", "Initialized enterprise demonstration dataset with 5 orders, 2 partners, and tracking events."));
    }

    private void createDemoOrder(Customer customer, DeliveryPartner partner, String orderNum, String trackNum,
                                 OrderStatus orderStatus, ShipmentStatus shipmentStatus,
                                 String item1Name, BigDecimal item1Price, int item1Qty,
                                 String item2Name, BigDecimal item2Price, int item2Qty,
                                 Instant createdAt, Instant estimatedDelivery, boolean isDelayed, String delayReason) {

        Order order = new Order();
        order.setOrderNumber(orderNum);
        order.setCustomer(customer);
        order.setShippingAddress(customer.getShippingAddress());
        order.setCity(customer.getCity());
        order.setState(customer.getState());
        order.setPostalCode(customer.getPostalCode());
        order.setStatus(orderStatus);
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setCreatedAt(createdAt);
        order.setUpdatedAt(createdAt);
        order.setEstimatedDeliveryDate(estimatedDelivery);

        BigDecimal subtotal1 = item1Price.multiply(BigDecimal.valueOf(item1Qty));
        BigDecimal subtotal2 = item2Price.multiply(BigDecimal.valueOf(item2Qty));
        BigDecimal total = subtotal1.add(subtotal2);
        BigDecimal tax = total.multiply(new BigDecimal("0.18")).setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal finalAmount = total.add(tax);

        order.setTotalAmount(total);
        order.setTaxAmount(tax);
        order.setShippingFee(BigDecimal.ZERO);
        order.setFinalAmount(finalAmount);

        OrderItem oi1 = new OrderItem(item1Name, "SKU-" + orderNum.substring(10) + "-1", item1Price, item1Qty, subtotal1, null);
        OrderItem oi2 = new OrderItem(item2Name, "SKU-" + orderNum.substring(10) + "-2", item2Price, item2Qty, subtotal2, null);
        order.addItem(oi1);
        order.addItem(oi2);

        Order savedOrder = orderRepository.save(order);

        // Payment & Invoice
        paymentRepository.save(new Payment("TXN-" + orderNum.substring(7), savedOrder, finalAmount, "CREDIT_CARD", "SUCCESS"));
        invoiceRepository.save(new Invoice("INV-" + orderNum.substring(7), savedOrder, finalAmount, tax, "/api/orders/" + savedOrder.getId() + "/invoice"));

        // Shipment
        Shipment shipment = new Shipment();
        shipment.setTrackingNumber(trackNum);
        shipment.setOrder(savedOrder);
        shipment.setDeliveryPartner(partner);
        shipment.setStatus(shipmentStatus);
        shipment.setCarrierName("TrackCart Express");
        shipment.setEstimatedDeliveryDate(estimatedDelivery);
        shipment.setIsDelayed(isDelayed);
        shipment.setDelayReason(delayReason);

        if (shipmentStatus == ShipmentStatus.DELIVERED) {
            shipment.setDeliveredTime(estimatedDelivery);
            shipment.setPickupTime(createdAt.plus(6, ChronoUnit.HOURS));
        } else if (shipmentStatus == ShipmentStatus.OUT_FOR_DELIVERY || shipmentStatus == ShipmentStatus.IN_TRANSIT || shipmentStatus == ShipmentStatus.DELAYED) {
            shipment.setPickupTime(createdAt.plus(4, ChronoUnit.HOURS));
        }

        Shipment savedShipment = shipmentRepository.save(shipment);

        // Timeline Events
        createTimelineEvents(savedShipment, shipmentStatus, customer.getCity(), createdAt, isDelayed, delayReason);
    }

    private void createTimelineEvents(Shipment shipment, ShipmentStatus status, String city, Instant created, boolean isDelayed, String delayReason) {
        // Event 1: Placed
        TrackingEvent e1 = new TrackingEvent(ShipmentStatus.MANIFESTED, city, "Order placed and authorized.", "CUSTOMER", created);
        shipment.addEvent(e1);

        // Event 2: Confirmed
        TrackingEvent e2 = new TrackingEvent(ShipmentStatus.CONFIRMED, "Fulfillment Regional Hub", "Inventory confirmed and packaging queued.", "SYSTEM", created.plus(30, ChronoUnit.MINUTES));
        shipment.addEvent(e2);

        if (status == ShipmentStatus.CONFIRMED && !isDelayed) {
            trackingEventRepository.saveAll(List.of(e1, e2));
            return;
        }

        // Event 3: Packed
        TrackingEvent e3 = new TrackingEvent(ShipmentStatus.PACKED, "Warehouse Staging Area", "Package inspected, barcoded and staged for pickup.", "WAREHOUSE", created.plus(2, ChronoUnit.HOURS));
        shipment.addEvent(e3);

        if (status == ShipmentStatus.PACKED && !isDelayed) {
            trackingEventRepository.saveAll(List.of(e1, e2, e3));
            return;
        }

        // Event 4: Shipped / In Transit
        TrackingEvent e4 = new TrackingEvent(ShipmentStatus.IN_TRANSIT, "Central Distribution Center", "Dispatched in logistics line-haul transit.", "CARRIER", created.plus(8, ChronoUnit.HOURS));
        shipment.addEvent(e4);

        if (isDelayed) {
            TrackingEvent eDelay = new TrackingEvent(ShipmentStatus.DELAYED, "Interstate Junction Hub", delayReason != null ? delayReason : "Shipment delayed.", "DISPATCH", created.plus(24, ChronoUnit.HOURS));
            shipment.addEvent(eDelay);
            trackingEventRepository.saveAll(List.of(e1, e2, e3, e4, eDelay));
            return;
        }

        if (status == ShipmentStatus.SHIPPED || status == ShipmentStatus.IN_TRANSIT) {
            trackingEventRepository.saveAll(List.of(e1, e2, e3, e4));
            return;
        }

        // Event 5: Out for delivery
        TrackingEvent e5 = new TrackingEvent(ShipmentStatus.OUT_FOR_DELIVERY, city + " Local Facility", "Package assigned to courier and out for final delivery.", "DELIVERY_PARTNER", created.plus(20, ChronoUnit.HOURS));
        shipment.addEvent(e5);

        if (status == ShipmentStatus.OUT_FOR_DELIVERY) {
            trackingEventRepository.saveAll(List.of(e1, e2, e3, e4, e5));
            return;
        }

        // Event 6: Delivered
        if (status == ShipmentStatus.DELIVERED) {
            TrackingEvent e6 = new TrackingEvent(ShipmentStatus.DELIVERED, city + " Front Door", "Delivered and signed by recipient.", "DELIVERY_PARTNER", created.plus(22, ChronoUnit.HOURS));
            shipment.addEvent(e6);
            trackingEventRepository.saveAll(List.of(e1, e2, e3, e4, e5, e6));
        } else {
            trackingEventRepository.saveAll(List.of(e1, e2, e3, e4, e5));
        }
    }
}
