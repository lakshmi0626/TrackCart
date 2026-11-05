package com.trackcart.dto;

import com.trackcart.model.DeliveryPartner;

public class DeliveryPartnerResponse {

    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String vehicleType;
    private String vehicleNumber;
    private String licenseNumber;
    private Double currentLat;
    private Double currentLng;
    private Boolean isAvailable;
    private Double rating;
    private Integer completedDeliveries;

    public DeliveryPartnerResponse() {}

    public static DeliveryPartnerResponse fromEntity(DeliveryPartner dp) {
        DeliveryPartnerResponse res = new DeliveryPartnerResponse();
        res.setId(dp.getId());
        if (dp.getUser() != null) {
            res.setUserId(dp.getUser().getId());
            res.setFullName(dp.getUser().getFullName());
            res.setEmail(dp.getUser().getEmail());
            res.setPhone(dp.getUser().getPhone());
        }
        res.setVehicleType(dp.getVehicleType());
        res.setVehicleNumber(dp.getVehicleNumber());
        res.setLicenseNumber(dp.getLicenseNumber());
        res.setCurrentLat(dp.getCurrentLat());
        res.setCurrentLng(dp.getCurrentLng());
        res.setIsAvailable(dp.getIsAvailable());
        res.setRating(dp.getRating());
        res.setCompletedDeliveries(dp.getCompletedDeliveries());
        return res;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

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
