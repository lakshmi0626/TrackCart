package com.trackcart.dto;

import com.trackcart.model.Complaint;
import com.trackcart.model.ComplaintPriority;
import com.trackcart.model.ComplaintStatus;

import java.time.Instant;

public class ComplaintResponse {

    private Long id;
    private String ticketNumber;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private Long orderId;
    private String orderNumber;
    private String subject;
    private String description;
    private ComplaintPriority priority;
    private ComplaintStatus status;
    private String resolutionNotes;
    private Instant resolvedAt;
    private Instant createdAt;

    public ComplaintResponse() {}

    public static ComplaintResponse fromEntity(Complaint c) {
        ComplaintResponse res = new ComplaintResponse();
        res.setId(c.getId());
        res.setTicketNumber(c.getTicketNumber());
        if (c.getCustomer() != null) {
            res.setCustomerId(c.getCustomer().getId());
            if (c.getCustomer().getUser() != null) {
                res.setCustomerName(c.getCustomer().getUser().getFullName());
                res.setCustomerEmail(c.getCustomer().getUser().getEmail());
            }
        }
        if (c.getOrder() != null) {
            res.setOrderId(c.getOrder().getId());
            res.setOrderNumber(c.getOrder().getOrderNumber());
        }
        res.setSubject(c.getSubject());
        res.setDescription(c.getDescription());
        res.setPriority(c.getPriority());
        res.setStatus(c.getStatus());
        res.setResolutionNotes(c.getResolutionNotes());
        res.setResolvedAt(c.getResolvedAt());
        res.setCreatedAt(c.getCreatedAt());
        return res;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTicketNumber() { return ticketNumber; }
    public void setTicketNumber(String ticketNumber) { this.ticketNumber = ticketNumber; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ComplaintPriority getPriority() { return priority; }
    public void setPriority(ComplaintPriority priority) { this.priority = priority; }

    public ComplaintStatus getStatus() { return status; }
    public void setStatus(ComplaintStatus status) { this.status = status; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
