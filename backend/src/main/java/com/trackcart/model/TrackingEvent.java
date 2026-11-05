package com.trackcart.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "tracking_events")
public class TrackingEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    @JsonBackReference
    private Shipment shipment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ShipmentStatus status;

    @Column(length = 150)
    private String location;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "event_timestamp")
    private Instant eventTimestamp = Instant.now();

    @Column(name = "actor_role", nullable = false, length = 40)
    private String actorRole;

    public TrackingEvent() {}

    public TrackingEvent(ShipmentStatus status, String location, String description, String actorRole) {
        this.status = status;
        this.location = location;
        this.description = description;
        this.actorRole = actorRole;
        this.eventTimestamp = Instant.now();
    }

    public TrackingEvent(ShipmentStatus status, String location, String description, String actorRole, Instant timestamp) {
        this.status = status;
        this.location = location;
        this.description = description;
        this.actorRole = actorRole;
        this.eventTimestamp = timestamp;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Shipment getShipment() { return shipment; }
    public void setShipment(Shipment shipment) { this.shipment = shipment; }

    public ShipmentStatus getStatus() { return status; }
    public void setStatus(ShipmentStatus status) { this.status = status; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Instant getEventTimestamp() { return eventTimestamp; }
    public void setEventTimestamp(Instant eventTimestamp) { this.eventTimestamp = eventTimestamp; }

    public String getActorRole() { return actorRole; }
    public void setActorRole(String actorRole) { this.actorRole = actorRole; }
}
