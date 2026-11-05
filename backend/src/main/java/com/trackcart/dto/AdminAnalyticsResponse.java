package com.trackcart.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class AdminAnalyticsResponse {

    private long totalOrders;
    private BigDecimal totalRevenue;
    private long totalCustomers;
    private long totalDeliveryPartners;
    private long pendingDeliveries;
    private long deliveredOrders;
    private long delayedOrders;
    private long openComplaints;
    private Map<String, Long> statusDistribution;
    private List<OrderResponse> recentOrders;

    public AdminAnalyticsResponse() {}

    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public long getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; }

    public long getTotalDeliveryPartners() { return totalDeliveryPartners; }
    public void setTotalDeliveryPartners(long totalDeliveryPartners) { this.totalDeliveryPartners = totalDeliveryPartners; }

    public long getPendingDeliveries() { return pendingDeliveries; }
    public void setPendingDeliveries(long pendingDeliveries) { this.pendingDeliveries = pendingDeliveries; }

    public long getDeliveredOrders() { return deliveredOrders; }
    public void setDeliveredOrders(long deliveredOrders) { this.deliveredOrders = deliveredOrders; }

    public long getDelayedOrders() { return delayedOrders; }
    public void setDelayedOrders(long delayedOrders) { this.delayedOrders = delayedOrders; }

    public long getOpenComplaints() { return openComplaints; }
    public void setOpenComplaints(long openComplaints) { this.openComplaints = openComplaints; }

    public Map<String, Long> getStatusDistribution() { return statusDistribution; }
    public void setStatusDistribution(Map<String, Long> statusDistribution) { this.statusDistribution = statusDistribution; }

    public List<OrderResponse> getRecentOrders() { return recentOrders; }
    public void setRecentOrders(List<OrderResponse> recentOrders) { this.recentOrders = recentOrders; }
}
