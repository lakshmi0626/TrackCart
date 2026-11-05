package com.trackcart.service;

import com.trackcart.model.Order;
import com.trackcart.model.Shipment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.CompletableFuture;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    public CompletableFuture<Boolean> sendOrderConfirmationEmail(Order order) {
        return CompletableFuture.supplyAsync(() -> {
            String customerEmail = order.getCustomer() != null && order.getCustomer().getUser() != null
                    ? order.getCustomer().getUser().getEmail()
                    : "customer@trackcart.io";

            log.info("[EMAIL DISPATCH] To: {}, Subject: Order Confirmed #{} (Total: ${}) at {}",
                    customerEmail, order.getOrderNumber(), order.getTotalAmount(), Instant.now());
            return true;
        });
    }

    public CompletableFuture<Boolean> sendShipmentDispatchedEmail(Shipment shipment) {
        return CompletableFuture.supplyAsync(() -> {
            String customerEmail = shipment.getOrder() != null && shipment.getOrder().getCustomer() != null && shipment.getOrder().getCustomer().getUser() != null
                    ? shipment.getOrder().getCustomer().getUser().getEmail()
                    : "customer@trackcart.io";

            log.info("[EMAIL DISPATCH] To: {}, Subject: Package Dispatched! Tracking ID: {} (Carrier: {}) at {}",
                    customerEmail, shipment.getTrackingNumber(), shipment.getCarrierName(), Instant.now());
            return true;
        });
    }

    public CompletableFuture<Boolean> sendDeliveryCompletedEmail(Shipment shipment) {
        return CompletableFuture.supplyAsync(() -> {
            String customerEmail = shipment.getOrder() != null && shipment.getOrder().getCustomer() != null && shipment.getOrder().getCustomer().getUser() != null
                    ? shipment.getOrder().getCustomer().getUser().getEmail()
                    : "customer@trackcart.io";

            log.info("[EMAIL DISPATCH] To: {}, Subject: Package Delivered! Tracking ID: {} at {}",
                    customerEmail, shipment.getTrackingNumber(), Instant.now());
            return true;
        });
    }
}
