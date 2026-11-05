package com.trackcart.service;

import com.trackcart.dto.ComplaintRequest;
import com.trackcart.dto.ComplaintResponse;
import com.trackcart.exception.ResourceNotFoundException;
import com.trackcart.model.*;
import com.trackcart.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final AuthService authService;

    public ComplaintService(ComplaintRepository complaintRepository,
                            CustomerRepository customerRepository,
                            OrderRepository orderRepository,
                            NotificationRepository notificationRepository,
                            AuditLogRepository auditLogRepository,
                            AuthService authService) {
        this.complaintRepository = complaintRepository;
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogRepository = auditLogRepository;
        this.authService = authService;
    }

    @Transactional
    public ComplaintResponse createComplaint(ComplaintRequest request) {
        User user = authService.getCurrentUser();
        Customer customer = customerRepository.findByUser(user)
                .orElseGet(() -> customerRepository.save(new Customer(user, "Default Address", "Metro", "State", "000000", "India")));

        Order order = null;
        if (request.getOrderId() != null) {
            order = orderRepository.findById(request.getOrderId()).orElse(null);
        }

        Complaint complaint = new Complaint();
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        complaint.setTicketNumber("TKT-TC-" + uniqueSuffix);
        complaint.setCustomer(customer);
        complaint.setOrder(order);
        complaint.setSubject(request.getSubject());
        complaint.setDescription(request.getDescription());
        complaint.setPriority(request.getPriority() != null ? request.getPriority() : ComplaintPriority.MEDIUM);
        complaint.setStatus(ComplaintStatus.OPEN);
        complaint.setCreatedAt(Instant.now());

        Complaint saved = complaintRepository.save(complaint);

        // Notify customer confirmation
        Notification notif = new Notification(
                user,
                "Support Ticket Created: " + saved.getTicketNumber(),
                "Your complaint regarding \"" + saved.getSubject() + "\" has been logged. Our support team will review it shortly.",
                NotificationType.COMPLAINT
        );
        notificationRepository.save(notif);

        // Audit Log
        AuditLog audit = new AuditLog(
                "COMPLAINT_CREATED",
                "Complaint",
                saved.getId().toString(),
                user.getEmail(),
                "Logged support ticket " + saved.getTicketNumber() + " with priority " + saved.getPriority()
        );
        auditLogRepository.save(audit);

        return ComplaintResponse.fromEntity(saved);
    }

    public List<ComplaintResponse> getComplaintsForCurrentUser() {
        User user = authService.getCurrentUser();
        List<Complaint> list;

        if (user.getRole() == Role.ADMIN) {
            list = complaintRepository.findAll();
        } else {
            Customer customer = customerRepository.findByUser(user).orElse(null);
            if (customer == null) {
                return List.of();
            }
            list = complaintRepository.findByCustomerOrderByCreatedAtDesc(customer);
        }

        return list.stream()
                .map(ComplaintResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public ComplaintResponse getComplaintById(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));
        return ComplaintResponse.fromEntity(complaint);
    }

    @Transactional
    public ComplaintResponse updateComplaintStatus(Long id, ComplaintStatus status, String resolutionNotes) {
        User user = authService.getCurrentUser();
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        complaint.setStatus(status);
        if (resolutionNotes != null && !resolutionNotes.isBlank()) {
            complaint.setResolutionNotes(resolutionNotes);
        }

        if (status == ComplaintStatus.RESOLVED || status == ComplaintStatus.CLOSED) {
            complaint.setResolvedAt(Instant.now());
        }

        Complaint saved = complaintRepository.save(complaint);

        // Notify customer
        if (saved.getCustomer() != null && saved.getCustomer().getUser() != null) {
            Notification notif = new Notification(
                    saved.getCustomer().getUser(),
                    "Ticket Update: " + saved.getTicketNumber(),
                    "Status changed to " + status.name() + ". Notes: " + (resolutionNotes != null ? resolutionNotes : "Updated by administrator"),
                    NotificationType.COMPLAINT
            );
            notificationRepository.save(notif);
        }

        AuditLog audit = new AuditLog(
                "COMPLAINT_UPDATED",
                "Complaint",
                saved.getId().toString(),
                user.getEmail(),
                "Updated status to " + status.name()
        );
        auditLogRepository.save(audit);

        return ComplaintResponse.fromEntity(saved);
    }
}
