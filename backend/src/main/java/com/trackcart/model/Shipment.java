package com.trackcart.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "shipments")
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tracking_number", nullable = false, unique = true, length = 60)
    private String trackingNumber;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "delivery_partner_id")
    private DeliveryPartner deliveryPartner;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ShipmentStatus status = ShipmentStatus.MANIFESTED;

    @Column(name = "carrier_name", length = 100)
    private String carrierName = "TrackCart Express";

    @Column(name = "pickup_time")
    private Instant pickupTime;

    @Column(name = "delivered_time")
    private Instant deliveredTime;

    @Column(name = "estimated_delivery_date")
    private Instant estimatedDeliveryDate;

    @Column(name = "is_delayed")
    private Boolean isDelayed = false;

    @Column(name = "delay_reason", columnDefinition = "TEXT")
    private String delayReason;

    @OneToMany(mappedBy = "shipment", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("eventTimestamp ASC")
    @JsonManagedReference
    private List<TrackingEvent> events = new ArrayList<>();

    public Shipment() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public DeliveryPartner getDeliveryPartner() { return deliveryPartner; }
    public void setDeliveryPartner(DeliveryPartner deliveryPartner) { this.deliveryPartner = deliveryPartner; }

    public ShipmentStatus getStatus() { return status; }
    public void setStatus(ShipmentStatus status) { this.status = status; }

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

    public List<TrackingEvent> getEvents() { return events; }
    public void setEvents(List<TrackingEvent> events) { this.events = events; }

    public void addEvent(TrackingEvent event) {
        events.add(event);
        event.setShipment(this);
    }
}
