package com.trackcart.service;

import com.trackcart.model.Shipment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class SmsWebhookService {

    private static final Logger log = LoggerFactory.getLogger(SmsWebhookService.class);

    public CompletableFuture<Map<String, Object>> dispatchMilestoneSms(Shipment shipment, String milestoneNote) {
        return CompletableFuture.supplyAsync(() -> {
            String recipientPhone = shipment.getOrder() != null && shipment.getOrder().getCustomer() != null && shipment.getOrder().getCustomer().getUser() != null
                    ? shipment.getOrder().getCustomer().getUser().getPhone()
                    : "+15550192834";

            Map<String, Object> webhookPayload = new HashMap<>();
            webhookPayload.put("provider", "Twilio-Compatible-SMS-Gateway");
            webhookPayload.put("to", recipientPhone);
            webhookPayload.put("trackingNumber", shipment.getTrackingNumber());
            webhookPayload.put("status", shipment.getStatus().name());
            webhookPayload.put("message", "TrackCart Alert: " + milestoneNote + " Tracking: " + shipment.getTrackingNumber());
            webhookPayload.put("timestamp", Instant.now().toString());

            log.info("[SMS WEBHOOK] Dispatched SMS to {} for Tracking {}: {}",
                    recipientPhone, shipment.getTrackingNumber(), webhookPayload.get("message"));

            return webhookPayload;
        });
    }
}
