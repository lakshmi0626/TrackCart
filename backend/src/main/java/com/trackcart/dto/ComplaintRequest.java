package com.trackcart.dto;

import com.trackcart.model.ComplaintPriority;
import jakarta.validation.constraints.NotBlank;

public class ComplaintRequest {

    private Long orderId;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Description is required")
    private String description;

    private ComplaintPriority priority = ComplaintPriority.MEDIUM;

    public ComplaintRequest() {}

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ComplaintPriority getPriority() { return priority; }
    public void setPriority(ComplaintPriority priority) { this.priority = priority; }
}
