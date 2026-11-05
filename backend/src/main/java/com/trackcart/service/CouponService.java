package com.trackcart.service;

import com.trackcart.model.Coupon;
import com.trackcart.repository.CouponRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

@Service
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    public BigDecimal calculateDiscount(String code, BigDecimal subtotal) {
        if (code == null || code.trim().isEmpty() || subtotal == null || subtotal.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        String normalized = code.trim().toUpperCase();

        Optional<Coupon> opt = couponRepository.findByCodeIgnoreCaseAndActiveTrue(normalized);
        if (opt.isPresent()) {
            Coupon c = opt.get();
            if (c.getMinOrderAmount() != null && subtotal.compareTo(c.getMinOrderAmount()) < 0) {
                return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
            }
            BigDecimal discount = subtotal.multiply(c.getDiscountPercentage().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
            if (c.getMaxDiscountAmount() != null && discount.compareTo(c.getMaxDiscountAmount()) > 0) {
                discount = c.getMaxDiscountAmount();
            }
            return discount.setScale(2, RoundingMode.HALF_UP);
        }

        // Built-in promotional fallbacks
        if ("WELCOME10".equals(normalized)) {
            return subtotal.multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP);
        } else if ("TRACK20".equals(normalized)) {
            BigDecimal disc = subtotal.multiply(new BigDecimal("0.20")).setScale(2, RoundingMode.HALF_UP);
            return disc.min(new BigDecimal("50.00"));
        }

        return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    }
}
