package com.trackcart.repository;

import com.trackcart.model.Complaint;
import com.trackcart.model.ComplaintStatus;
import com.trackcart.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    Optional<Complaint> findByTicketNumber(String ticketNumber);
    List<Complaint> findByCustomerOrderByCreatedAtDesc(Customer customer);
    List<Complaint> findByStatus(ComplaintStatus status);
    long countByStatus(ComplaintStatus status);
}
