package com.trackcart.repository;

import com.trackcart.model.DeliveryPartner;
import com.trackcart.model.Order;
import com.trackcart.model.Shipment;
import com.trackcart.model.ShipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    Optional<Shipment> findByTrackingNumber(String trackingNumber);
    Optional<Shipment> findByOrder(Order order);
    Optional<Shipment> findByOrderId(Long orderId);
    List<Shipment> findByDeliveryPartnerOrderByEstimatedDeliveryDateAsc(DeliveryPartner partner);
    List<Shipment> findByDeliveryPartnerId(Long deliveryPartnerId);
    List<Shipment> findByStatus(ShipmentStatus status);
    List<Shipment> findByIsDelayedTrue();
    long countByStatus(ShipmentStatus status);
    long countByIsDelayedTrue();
}
