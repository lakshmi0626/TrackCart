package com.trackcart.service;

import com.trackcart.model.Coupon;
import com.trackcart.repository.CouponRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.FluentQuery;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CouponServiceTest {

    @Test
    @DisplayName("Should apply 10% discount for WELCOME10 promotional code")
    void testWelcome10Fallback() {
        CouponService couponService = new CouponService(null);
        BigDecimal subtotal = new BigDecimal("150.00");
        BigDecimal discount = couponService.calculateDiscount("WELCOME10", subtotal);
        assertEquals(new BigDecimal("15.00"), discount);
    }

    @Test
    @DisplayName("Should cap TRACK20 discount at $50.00 max")
    void testTrack20Capped() {
        CouponService couponService = new CouponService(null);
        BigDecimal subtotal = new BigDecimal("500.00");
        BigDecimal discount = couponService.calculateDiscount("TRACK20", subtotal);
        assertEquals(new BigDecimal("50.00"), discount);
    }

    @Test
    @DisplayName("Should return 0 for invalid or empty coupon")
    void testInvalidCoupon() {
        CouponService couponService = new CouponService(null);
        BigDecimal discount = couponService.calculateDiscount("INVALID99", new BigDecimal("100.00"));
        assertEquals(new BigDecimal("0.00"), discount);

        BigDecimal emptyDiscount = couponService.calculateDiscount("", new BigDecimal("100.00"));
        assertEquals(new BigDecimal("0.00"), emptyDiscount);
    }
}
