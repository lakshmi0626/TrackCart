package com.trackcart.dto;

import com.trackcart.model.Shipment;
import com.trackcart.model.ShipmentStatus;
import com.trackcart.model.TrackingEvent;

import java.time.Instant;
import java.util.List;

public class ShipmentResponse {

    private Long id;
    private String trackingNumber;
    private Long orderId;
    private String orderNumber;
    private ShipmentStatus status;
    private int currentStage; // 0=ORDER PLACED, 1=CONFIRMED, 2=PACKED, 3=SHIPPED, 4=OUT FOR DELIVERY, 5=DELIVERED
    private String carrierName;
    private Instant pickupTime;
    private Instant deliveredTime;
    private Instant estimatedDeliveryDate;
    private Boolean isDelayed;
    private String delayReason;

    private Long partnerId;
    private String partnerName;
    private String partnerPhone;
    private String partnerVehicle;
    private Double partnerLat;
    private Double partnerLng;

    private String destinationCity;
    private String destinationAddress;

    private List<TrackingEvent> events;

    public ShipmentResponse() {}

    public static ShipmentResponse fromShipment(Shipment s) {
        ShipmentResponse res = new ShipmentResponse();
        res.setId(s.getId());
        res.setTrackingNumber(s.getTrackingNumber());
        if (s.getOrder() != null) {
            res.setOrderId(s.getOrder().getId());
            res.setOrderNumber(s.getOrder().getOrderNumber());
            res.setDestinationCity(s.getOrder().getCity());
            res.setDestinationAddress(s.getOrder().getShippingAddress() + ", " + s.getOrder().getCity() + ", " + s.getOrder().getState());
        }
        res.setStatus(s.getStatus());
        res.setCarrierName(s.getCarrierName());
        res.setPickupTime(s.getPickupTime());
        res.setDeliveredTime(s.getDeliveredTime());
        res.setEstimatedDeliveryDate(s.getEstimatedDeliveryDate());
        res.setIsDelayed(s.getIsDelayed());
        res.setDelayReason(s.getDelayReason());
        res.setEvents(s.getEvents());

        if (s.getDeliveryPartner() != null) {
            res.setPartnerId(s.getDeliveryPartner().getId());
            if (s.getDeliveryPartner().getUser() != null) {
                res.setPartnerName(s.getDeliveryPartner().getUser().getFullName());
                res.setPartnerPhone(s.getDeliveryPartner().getUser().getPhone());
            }
            res.setPartnerVehicle(s.getDeliveryPartner().getVehicleType() + " (" + s.getDeliveryPartner().getVehicleNumber() + ")");
            res.setPartnerLat(s.getDeliveryPartner().getCurrentLat());
            res.setPartnerLng(s.getDeliveryPartner().getCurrentLng());
        }

        // Calculate progress stage: ORDER PLACED (0) -> CONFIRMED (1) -> PACKED (2) -> SHIPPED (3) -> OUT FOR DELIVERY (4) -> DELIVERED (5)
        int stage = 0;
        if (s.getStatus() != null) {
            switch (s.getStatus()) {
                case MANIFESTED -> stage = 0;
                case CONFIRMED -> stage = 1;
                case PACKED, PICKED_UP -> stage = 2;
                case SHIPPED, IN_TRANSIT -> stage = 3;
                case OUT_FOR_DELIVERY -> stage = 4;
                case DELIVERED -> stage = 5;
                case DELAYED -> stage = 3;
                default -> stage = 1;
            }
        }
        res.setCurrentStage(stage);

        return res;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public ShipmentStatus getStatus() { return status; }
    public void setStatus(ShipmentStatus status) { this.status = status; }

    public int getCurrentStage() { return currentStage; }
    public void setCurrentStage(int currentStage) { this.currentStage = currentStage; }

    public String getCarrierName() { return carrierName; }
    public void setCarrierName(String carrierName) { this.carrierName = carrierName; }

    public Instant getPickupTime() { return pickupTime; }
    public void setPickupTime(Instant pickupTime) { this.pickupTime = pickupTime; }

    public Instant getDeliveredTime() { return deliveredTime; }
    public void setDeliveredTime(Instant deliveredTime) { this.deliveredTime = deliveredTime; }

    public Instant getEstimatedDeliveryDate() { return estimatedDeliveryDate; }
    public void setEstimatedDeliveryDate(Instant estimatedDeliveryDate) { this.estimatedDeliveryDate = estimatedDeliveryDate; }

    public Boolean getIsDelayed() { return isDelayed; }
    public void setIsDelayed(Boolean isDelayed) { this.isDelayed = isDelayed; }

    public String getDelayReason() { return delayReason; }
    public void setDelayReason(String delayReason) { this.delayReason = delayReason; }

    public Long getPartnerId() { return partnerId; }
    public void setPartnerId(Long partnerId) { this.partnerId = partnerId; }

    public String getPartnerName() { return partnerName; }
    public void setPartnerName(String partnerName) { this.partnerName = partnerName; }

    public String getPartnerPhone() { return partnerPhone; }
    public void setPartnerPhone(String partnerPhone) { this.partnerPhone = partnerPhone; }

    public String getPartnerVehicle() { return partnerVehicle; }
    public void setPartnerVehicle(String partnerVehicle) { this.partnerVehicle = partnerVehicle; }

    public Double getPartnerLat() { return partnerLat; }
    public void setPartnerLat(Double partnerLat) { this.partnerLat = partnerLat; }

    public Double getPartnerLng() { return partnerLng; }
    public void setPartnerLng(Double partnerLng) { this.partnerLng = partnerLng; }

    public String getDestinationCity() { return destinationCity; }
    public void setDestinationCity(String destinationCity) { this.destinationCity = destinationCity; }

    public String getDestinationAddress() { return destinationAddress; }
    public void setDestinationAddress(String destinationAddress) { this.destinationAddress = destinationAddress; }

    public List<TrackingEvent> getEvents() { return events; }
    public void setEvents(List<TrackingEvent> events) { this.events = events; }
}
