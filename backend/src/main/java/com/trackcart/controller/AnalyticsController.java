package com.trackcart.controller;

import com.trackcart.dto.AdminAnalyticsResponse;
import com.trackcart.dto.PartnerAnalyticsResponse;
import com.trackcart.model.AuditLog;
import com.trackcart.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@Tag(name = "Analytics & Reports", description = "Aggregated performance metrics, revenue tracking, and audit logging")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/admin-summary")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get high-level operations summary metrics for Admin Dashboard")
    public ResponseEntity<AdminAnalyticsResponse> getAdminSummary() {
        return ResponseEntity.ok(analyticsService.getAdminSummary());
    }

    @GetMapping("/partner-summary")
    @Operation(summary = "Get performance and payout summary metrics for Delivery Partner Dashboard")
    public ResponseEntity<PartnerAnalyticsResponse> getPartnerSummary() {
        return ResponseEntity.ok(analyticsService.getPartnerSummary());
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get recent immutable audit trail logs for enterprise compliance")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(analyticsService.getAuditLogs());
    }

    @GetMapping(value = "/export/orders/csv", produces = "text/csv")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Export all orders report in CSV format")
    public ResponseEntity<String> exportOrdersCsv() {
        String csv = analyticsService.generateOrdersCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"trackcart-orders.csv\"")
                .body(csv);
    }
}
