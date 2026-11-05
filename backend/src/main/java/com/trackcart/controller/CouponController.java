package com.trackcart.controller;

import com.trackcart.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
@Tag(name = "Coupons & Discounts", description = "Promotional code validation and discount calculations")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @PostMapping("/validate")
    @Operation(summary = "Validate a promo discount coupon against cart subtotal")
    public ResponseEntity<Map<String, Object>> validateCoupon(@RequestBody Map<String, Object> payload) {
        String code = (String) payload.get("code");
        Object subtotalObj = payload.get("subtotal");
        BigDecimal subtotal = BigDecimal.ZERO;
        if (subtotalObj != null) {
            subtotal = new BigDecimal(subtotalObj.toString());
        }

        BigDecimal discount = couponService.calculateDiscount(code, subtotal);
        Map<String, Object> res = new HashMap<>();
        boolean valid = discount.compareTo(BigDecimal.ZERO) > 0;
        res.put("valid", valid);
        res.put("code", code != null ? code.toUpperCase() : "");
        res.put("discount", discount);
        res.put("message", valid ? "Coupon applied successfully!" : "Invalid or ineligible coupon code.");

        return ResponseEntity.ok(res);
    }
}
