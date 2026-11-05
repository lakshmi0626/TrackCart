package com.trackcart.repository;

import com.trackcart.model.Customer;
import com.trackcart.model.Order;
import com.trackcart.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByCustomerOrderByCreatedAtDesc(Customer customer);
    Page<Order> findByCustomerId(Long customerId, Pageable pageable);
    List<Order> findByStatus(OrderStatus status);
    long countByStatus(OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.finalAmount), 0) FROM Order o WHERE o.status <> 'CANCELLED'")
    BigDecimal calculateTotalRevenue();

    @Query("SELECT o FROM Order o WHERE LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(o.customer.user.fullName) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Order> searchOrders(String search);
}
