package com.trackcart.service;

import com.trackcart.dto.ComplaintRequest;
import com.trackcart.dto.ComplaintResponse;
import com.trackcart.model.*;
import com.trackcart.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ComplaintServiceTest {

    @Mock private ComplaintRepository complaintRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private NotificationRepository notificationRepository;
    @Mock private AuditLogRepository auditLogRepository;
    @Mock private AuthService authService;

    private ComplaintService complaintService;
    private User testUser;
    private Customer testCustomer;

    @BeforeEach
    void setUp() {
        complaintService = new ComplaintService(
                complaintRepository,
                customerRepository,
                orderRepository,
                notificationRepository,
                auditLogRepository,
                authService
        );

        testUser = new User("user@example.com", "pass", "Test Customer", "+123", Role.CUSTOMER);
        testCustomer = new Customer(testUser, "Street 1", "City", "State", "000", "India");
    }

    @Test
    void createComplaint_generatesTicketNumber() {
        ComplaintRequest req = new ComplaintRequest();
        req.setSubject("Damaged Outer Packaging");
        req.setDescription("The box had severe dent on side.");
        req.setPriority(ComplaintPriority.HIGH);

        when(authService.getCurrentUser()).thenReturn(testUser);
        when(customerRepository.findByUser(testUser)).thenReturn(Optional.of(testCustomer));
        when(complaintRepository.save(any(Complaint.class))).thenAnswer(inv -> {
            Complaint c = inv.getArgument(0);
            c.setId(10L);
            return c;
        });

        ComplaintResponse res = complaintService.createComplaint(req);

        assertNotNull(res);
        assertTrue(res.getTicketNumber().startsWith("TKT-TC-"));
        assertEquals("Damaged Outer Packaging", res.getSubject());
        assertEquals(ComplaintPriority.HIGH, res.getPriority());
        assertEquals(ComplaintStatus.OPEN, res.getStatus());
    }

    @Test
    void updateComplaintStatus_resolved_setsResolvedTimestamp() {
        Complaint complaint = new Complaint();
        complaint.setId(15L);
        complaint.setStatus(ComplaintStatus.OPEN);
        complaint.setCustomer(testCustomer);

        when(authService.getCurrentUser()).thenReturn(testUser);
        when(complaintRepository.findById(15L)).thenReturn(Optional.of(complaint));
        when(complaintRepository.save(any(Complaint.class))).thenReturn(complaint);

        ComplaintResponse res = complaintService.updateComplaintStatus(15L, ComplaintStatus.RESOLVED, "Refund processed");

        assertNotNull(res);
        assertEquals(ComplaintStatus.RESOLVED, res.getStatus());
        assertEquals("Refund processed", res.getResolutionNotes());
        assertNotNull(complaint.getResolvedAt());
    }
}
