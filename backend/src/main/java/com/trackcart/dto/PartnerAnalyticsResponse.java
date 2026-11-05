package com.trackcart.dto;

import java.math.BigDecimal;

public class PartnerAnalyticsResponse {

    private long activeDeliveries;
    private long completedDeliveries;
    private double rating;
    private BigDecimal estimatedEarnings;
    private boolean isAvailable;

    public PartnerAnalyticsResponse() {}

    public PartnerAnalyticsResponse(long activeDeliveries, long completedDeliveries, double rating, BigDecimal estimatedEarnings, boolean isAvailable) {
        this.activeDeliveries = activeDeliveries;
        this.completedDeliveries = completedDeliveries;
        this.rating = rating;
        this.estimatedEarnings = estimatedEarnings;
        this.isAvailable = isAvailable;
    }

    public long getActiveDeliveries() { return activeDeliveries; }
    public void setActiveDeliveries(long activeDeliveries) { this.activeDeliveries = activeDeliveries; }

    public long getCompletedDeliveries() { return completedDeliveries; }
    public void setCompletedDeliveries(long completedDeliveries) { this.completedDeliveries = completedDeliveries; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public BigDecimal getEstimatedEarnings() { return estimatedEarnings; }
    public void setEstimatedEarnings(BigDecimal estimatedEarnings) { this.estimatedEarnings = estimatedEarnings; }

    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean available) { isAvailable = available; }
}
