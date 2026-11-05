package com.trackcart.dto;

import com.trackcart.model.ShipmentStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateShipmentStatusRequest {

    @NotNull(message = "Shipment status is required")
    private ShipmentStatus status;

    private String location;
    private String description;
    private Boolean isDelayed;
    private String delayReason;

    public UpdateShipmentStatusRequest() {}

    public ShipmentStatus getStatus() { return status; }
    public void setStatus(ShipmentStatus status) { this.status = status; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getIsDelayed() { return isDelayed; }
    public void setIsDelayed(Boolean isDelayed) { this.isDelayed = isDelayed; }

    public String getDelayReason() { return delayReason; }
    public void setDelayReason(String delayReason) { this.delayReason = delayReason; }
}
