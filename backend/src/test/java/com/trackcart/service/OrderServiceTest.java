package com.trackcart.service;

import com.trackcart.dto.CreateOrderRequest;
import com.trackcart.dto.OrderItemRequest;
import com.trackcart.dto.OrderResponse;
import com.trackcart.exception.BadRequestException;
import com.trackcart.model.*;
import com.trackcart.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private ShipmentRepository shipmentRepository;
    @Mock private TrackingEventRepository trackingEventRepository;
    @Mock private PaymentRepository paymentRepository;
    @Mock private InvoiceRepository invoiceRepository;
    @Mock private NotificationRepository notificationRepository;
    @Mock private AuditLogRepository auditLogRepository;
    @Mock private AuthService authService;
    @Mock private EmailService emailService;

    private OrderService orderService;
    private User testUser;
    private Customer testCustomer;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(
                orderRepository,
                customerRepository,
                shipmentRepository,
                trackingEventRepository,
                paymentRepository,
                invoiceRepository,
                notificationRepository,
                auditLogRepository,
                authService,
                emailService
        );

        testUser = new User("customer@example.com", "pass", "Customer User", "+123", Role.CUSTOMER);
        testUser.setId(1L);
        testCustomer = new Customer(testUser, "100 Market St", "San Francisco", "CA", "94105", "USA");
        testCustomer.setId(1L);
    }

    @Test
    void createOrder_computesTotalsAndCreatesShipment() {
        CreateOrderRequest req = new CreateOrderRequest();
        req.setItems(List.of(
                new OrderItemRequest("Wireless Mouse", "SKU-01", new BigDecimal("100.00"), 2, null)
        ));
        req.setShippingAddress("100 Market St");
        req.setCity("San Francisco");
        req.setState("CA");
        req.setPostalCode("94105");

        when(authService.getCurrentUser()).thenReturn(testUser);
        when(customerRepository.findByUser(testUser)).thenReturn(Optional.of(testCustomer));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(99L);
            return o;
        });
        when(shipmentRepository.save(any(Shipment.class))).thenAnswer(inv -> {
            Shipment s = inv.getArgument(0);
            s.setId(101L);
            return s;
        });

        OrderResponse res = orderService.createOrder(req);

        assertNotNull(res);
        assertEquals(new BigDecimal("200.00"), res.getTotalAmount());
        assertEquals(BigDecimal.ZERO, res.getShippingFee()); // Subtotal >= $100 -> Free shipping!
        assertEquals(new BigDecimal("36.00"), res.getTaxAmount()); // 18% of 200 = 36.00
        assertEquals(new BigDecimal("236.00"), res.getFinalAmount());
        assertNotNull(res.getTrackingNumber());
        assertTrue(res.getTrackingNumber().startsWith("TRK-TC-"));
    }

    @Test
    void cancelOrder_shippedOrder_throwsBadRequest() {
        Order shippedOrder = new Order();
        shippedOrder.setId(5L);
        shippedOrder.setStatus(OrderStatus.SHIPPED);

        when(authService.getCurrentUser()).thenReturn(testUser);
        when(orderRepository.findById(5L)).thenReturn(Optional.of(shippedOrder));

        assertThrows(BadRequestException.class, () -> orderService.cancelOrder(5L, "Want refund"));
    }
}
