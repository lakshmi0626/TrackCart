package com.trackcart.repository;

import com.trackcart.model.DeliveryPartner;
import com.trackcart.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryPartnerRepository extends JpaRepository<DeliveryPartner, Long> {
    Optional<DeliveryPartner> findByUser(User user);
    Optional<DeliveryPartner> findByUserId(Long userId);
    Optional<DeliveryPartner> findByUserEmail(String email);
    List<DeliveryPartner> findByIsAvailableTrue();
    long countByIsAvailableTrue();
}
