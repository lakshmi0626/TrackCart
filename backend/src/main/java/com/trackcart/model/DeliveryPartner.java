package com.trackcart.model;

import jakarta.persistence.*;

@Entity
@Table(name = "delivery_partners")
public class DeliveryPartner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "vehicle_type", length = 50)
    private String vehicleType;

    @Column(name = "vehicle_number", length = 50)
    private String vehicleNumber;

    @Column(name = "license_number", length = 50)
    private String licenseNumber;

    @Column(name = "current_lat")
    private Double currentLat = 12.9716; // default Bangalore coordinates for tracking demo

    @Column(name = "current_lng")
    private Double currentLng = 77.5946;

    @Column(name = "is_available")
    private Boolean isAvailable = true;

    private Double rating = 4.9;

    @Column(name = "completed_deliveries")
    private Integer completedDeliveries = 0;

    public DeliveryPartner() {}

    public DeliveryPartner(User user, String vehicleType, String vehicleNumber, String licenseNumber) {
        this.user = user;
        this.vehicleType = vehicleType;
        this.vehicleNumber = vehicleNumber;
        this.licenseNumber = licenseNumber;
        this.isAvailable = true;
        this.rating = 4.9;
        this.completedDeliveries = 0;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public Double getCurrentLat() { return currentLat; }
    public void setCurrentLat(Double currentLat) { this.currentLat = currentLat; }

    public Double getCurrentLng() { return currentLng; }
    public void setCurrentLng(Double currentLng) { this.currentLng = currentLng; }

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getCompletedDeliveries() { return completedDeliveries; }
    public void setCompletedDeliveries(Integer completedDeliveries) { this.completedDeliveries = completedDeliveries; }
}
