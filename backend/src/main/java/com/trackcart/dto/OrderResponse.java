package com.trackcart.dto;

import com.trackcart.model.Order;
import com.trackcart.model.OrderItem;
import com.trackcart.model.OrderStatus;
import com.trackcart.model.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class OrderResponse {

    private Long id;
    private String orderNumber;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private BigDecimal totalAmount;
    private BigDecimal taxAmount;
    private BigDecimal shippingFee;
    private BigDecimal finalAmount;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private String shippingAddress;
    private String city;
    private String state;
    private String postalCode;
    private Instant estimatedDeliveryDate;
    private String deliveryNotes;
    private Instant createdAt;
    private List<OrderItem> items;
    private String trackingNumber;
    private String shipmentStatus;
    private String assignedPartnerName;
    private String assignedPartnerPhone;

    public OrderResponse() {}

    public static OrderResponse fromOrder(Order order, String trackingNumber, String shipmentStatus, String partnerName, String partnerPhone) {
        OrderResponse res = new OrderResponse();
        res.setId(order.getId());
        res.setOrderNumber(order.getOrderNumber());
        if (order.getCustomer() != null) {
            res.setCustomerId(order.getCustomer().getId());
            if (order.getCustomer().getUser() != null) {
                res.setCustomerName(order.getCustomer().getUser().getFullName());
                res.setCustomerEmail(order.getCustomer().getUser().getEmail());
                res.setCustomerPhone(order.getCustomer().getUser().getPhone());
            }
        }
        res.setTotalAmount(order.getTotalAmount());
        res.setTaxAmount(order.getTaxAmount());
        res.setShippingFee(order.getShippingFee());
        res.setFinalAmount(order.getFinalAmount());
        res.setStatus(order.getStatus());
        res.setPaymentStatus(order.getPaymentStatus());
        res.setShippingAddress(order.getShippingAddress());
        res.setCity(order.getCity());
        res.setState(order.getState());
        res.setPostalCode(order.getPostalCode());
        res.setEstimatedDeliveryDate(order.getEstimatedDeliveryDate());
        res.setDeliveryNotes(order.getDeliveryNotes());
        res.setCreatedAt(order.getCreatedAt());
        res.setItems(order.getItems());
        res.setTrackingNumber(trackingNumber);
        res.setShipmentStatus(shipmentStatus);
        res.setAssignedPartnerName(partnerName);
        res.setAssignedPartnerPhone(partnerPhone);
        return res;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }

    public BigDecimal getShippingFee() { return shippingFee; }
    public void setShippingFee(BigDecimal shippingFee) { this.shippingFee = shippingFee; }

    public BigDecimal getFinalAmount() { return finalAmount; }
    public void setFinalAmount(BigDecimal finalAmount) { this.finalAmount = finalAmount; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public Instant getEstimatedDeliveryDate() { return estimatedDeliveryDate; }
    public void setEstimatedDeliveryDate(Instant estimatedDeliveryDate) { this.estimatedDeliveryDate = estimatedDeliveryDate; }

    public String getDeliveryNotes() { return deliveryNotes; }
    public void setDeliveryNotes(String deliveryNotes) { this.deliveryNotes = deliveryNotes; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public String getShipmentStatus() { return shipmentStatus; }
    public void setShipmentStatus(String shipmentStatus) { this.shipmentStatus = shipmentStatus; }

    public String getAssignedPartnerName() { return assignedPartnerName; }
    public void setAssignedPartnerName(String assignedPartnerName) { this.assignedPartnerName = assignedPartnerName; }

    public String getAssignedPartnerPhone() { return assignedPartnerPhone; }
    public void setAssignedPartnerPhone(String assignedPartnerPhone) { this.assignedPartnerPhone = assignedPartnerPhone; }
}
