package com.trackcart;

import com.trackcart.dto.CreateOrderRequest;
import com.trackcart.dto.OrderItemRequest;
import com.trackcart.dto.OrderResponse;
import com.trackcart.dto.ShipmentResponse;
import com.trackcart.model.*;
import com.trackcart.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class TrackCartDomainTest {

    @Test
    void testOrderCalculationAndItemSubtotals() {
        Order order = new Order();
        order.setOrderNumber("TC-ORD-TEST-1001");

        OrderItem item1 = new OrderItem("Mechanical Keyboard", "SKU-KEY-1", new BigDecimal("120.00"), 2, new BigDecimal("240.00"), null);
        OrderItem item2 = new OrderItem("Gaming Mouse", "SKU-MOU-2", new BigDecimal("60.00"), 1, new BigDecimal("60.00"), null);

        order.addItem(item1);
        order.addItem(item2);

        BigDecimal subtotal = item1.getSubtotal().add(item2.getSubtotal());
        assertEquals(new BigDecimal("300.00"), subtotal);

        // Shipping is free for orders over $100
        BigDecimal shipping = subtotal.compareTo(new BigDecimal("100.00")) >= 0 ? BigDecimal.ZERO : new BigDecimal("12.00");
        assertEquals(BigDecimal.ZERO, shipping);

        // Tax 18%
        BigDecimal tax = subtotal.multiply(new BigDecimal("0.18")).setScale(2, java.math.RoundingMode.HALF_UP);
        assertEquals(new BigDecimal("54.00"), tax);

        BigDecimal finalAmount = subtotal.add(shipping).add(tax).setScale(2, java.math.RoundingMode.HALF_UP);
        assertEquals(new BigDecimal("354.00"), finalAmount);

        order.setTotalAmount(subtotal);
        order.setShippingFee(shipping);
        order.setTaxAmount(tax);
        order.setFinalAmount(finalAmount);

        assertEquals(2, order.getItems().size());
        assertEquals(OrderStatus.CONFIRMED, order.getStatus());
    }

    @Test
    void testShipmentMilestoneProgressStages() {
        Shipment s = new Shipment();
        s.setTrackingNumber("TRK-TC-STAGE-TEST");

        s.setStatus(ShipmentStatus.MANIFESTED);
        assertEquals(0, ShipmentResponse.fromShipment(s).getCurrentStage());

        s.setStatus(ShipmentStatus.CONFIRMED);
        assertEquals(1, ShipmentResponse.fromShipment(s).getCurrentStage());

        s.setStatus(ShipmentStatus.PACKED);
        assertEquals(2, ShipmentResponse.fromShipment(s).getCurrentStage());

        s.setStatus(ShipmentStatus.SHIPPED);
        assertEquals(3, ShipmentResponse.fromShipment(s).getCurrentStage());

        s.setStatus(ShipmentStatus.OUT_FOR_DELIVERY);
        assertEquals(4, ShipmentResponse.fromShipment(s).getCurrentStage());

        s.setStatus(ShipmentStatus.DELIVERED);
        assertEquals(5, ShipmentResponse.fromShipment(s).getCurrentStage());
    }

    @Test
    void testDelayedShipmentDetection() {
        Shipment s = new Shipment();
        s.setTrackingNumber("TRK-TC-DELAY-TEST");
        s.setStatus(ShipmentStatus.IN_TRANSIT);
        s.setEstimatedDeliveryDate(Instant.now().minus(2, ChronoUnit.HOURS));

        // Overdue condition
        boolean isOverdue = s.getStatus() != ShipmentStatus.DELIVERED &&
                s.getEstimatedDeliveryDate() != null &&
                Instant.now().isAfter(s.getEstimatedDeliveryDate());

        assertTrue(isOverdue, "Shipment past estimated delivery date must be detected as overdue");

        s.setIsDelayed(true);
        s.setDelayReason("Severe transit bottleneck");

        ShipmentResponse res = ShipmentResponse.fromShipment(s);
        assertTrue(res.getIsDelayed());
        assertEquals("Severe transit bottleneck", res.getDelayReason());
    }

    @Test
    void testJwtTokenProviderCycle() {
        JwtTokenProvider provider = new JwtTokenProvider(
                "c7b203c6a46e1098651a3db518e3981fe1b6062f8cb519a79fa45759efc78bda",
                86400000L
        );

        String username = "logistics.manager@trackcart.io";
        String token = provider.generateTokenFromUsername(username);

        assertNotNull(token);
        assertTrue(provider.validateToken(token));
        assertEquals(username, provider.getUsernameFromJwt(token));
        assertFalse(provider.validateToken("invalid.token.signature"));
    }

    @Test
    void testUserRoleAndPrivileges() {
        User admin = new User("admin@trackcart.io", "pass", "Admin User", "+1", Role.ADMIN);
        User customer = new User("cust@trackcart.io", "pass", "Cust User", "+2", Role.CUSTOMER);
        User partner = new User("partner@trackcart.io", "pass", "Partner User", "+3", Role.DELIVERY_PARTNER);

        assertEquals(Role.ADMIN, admin.getRole());
        assertEquals(Role.CUSTOMER, customer.getRole());
        assertEquals(Role.DELIVERY_PARTNER, partner.getRole());
        assertEquals(UserStatus.ACTIVE, admin.getStatus());
    }

    @Test
    void testComplaintTicketEscalation() {
        Complaint c = new Complaint();
        c.setTicketNumber("TKT-TC-ESC-01");
        c.setPriority(ComplaintPriority.URGENT);
        c.setStatus(ComplaintStatus.OPEN);

        assertEquals(ComplaintStatus.OPEN, c.getStatus());
        assertEquals(ComplaintPriority.URGENT, c.getPriority());

        c.setStatus(ComplaintStatus.INVESTIGATING);
        c.setResolutionNotes("Dispatch routing expedited");
        assertEquals(ComplaintStatus.INVESTIGATING, c.getStatus());

        c.setStatus(ComplaintStatus.RESOLVED);
        c.setResolvedAt(Instant.now());
        assertNotNull(c.getResolvedAt());
    }
}
