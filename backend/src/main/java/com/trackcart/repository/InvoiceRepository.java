package com.trackcart.repository;

import com.trackcart.model.Invoice;
import com.trackcart.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    Optional<Invoice> findByOrder(Order order);
    Optional<Invoice> findByOrderId(Long orderId);
}
