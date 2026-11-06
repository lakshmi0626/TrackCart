package com.trackcart.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.io.File;
import java.lang.management.ManagementFactory;
import java.sql.Connection;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthCheckController {

    private final DataSource dataSource;

    public HealthCheckController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> ping() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "PONG");
        response.put("service", "trackcart-backend");
        response.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "trackcart-backend");
        health.put("version", "1.2.0");
        health.put("timestamp", Instant.now().toString());

        long uptimeMs = ManagementFactory.getRuntimeMXBean().getUptime();
        health.put("uptimeSeconds", uptimeMs / 1000);

        // Database status
        Map<String, Object> dbHealth = new HashMap<>();
        try (Connection connection = dataSource.getConnection()) {
            boolean valid = connection.isValid(2);
            dbHealth.put("status", valid ? "UP" : "DEGRADED");
            dbHealth.put("databaseProduct", connection.getMetaData().getDatabaseProductName());
        } catch (Exception ex) {
            dbHealth.put("status", "DOWN");
            dbHealth.put("error", ex.getMessage());
            health.put("status", "DEGRADED");
        }
        health.put("database", dbHealth);

        // JVM Memory status
        Runtime runtime = Runtime.getRuntime();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long usedMemory = totalMemory - freeMemory;
        long maxMemory = runtime.maxMemory();

        Map<String, Object> memory = new HashMap<>();
        memory.put("totalMemoryMb", totalMemory / (1024 * 1024));
        memory.put("freeMemoryMb", freeMemory / (1024 * 1024));
        memory.put("usedMemoryMb", usedMemory / (1024 * 1024));
        memory.put("maxMemoryMb", maxMemory / (1024 * 1024));
        memory.put("memoryUtilizationPercent", (double) Math.round(((double) usedMemory / totalMemory) * 10000) / 100);
        memory.put("availableProcessors", runtime.availableProcessors());
        memory.put("liveThreadCount", ManagementFactory.getThreadMXBean().getThreadCount());
        memory.put("peakThreadCount", ManagementFactory.getThreadMXBean().getPeakThreadCount());
        health.put("jvm", memory);

        // Disk space
        File root = new File(".");
        Map<String, Object> disk = new HashMap<>();
        disk.put("usableSpaceGb", root.getUsableSpace() / (1024 * 1024 * 1024));
        disk.put("totalSpaceGb", root.getTotalSpace() / (1024 * 1024 * 1024));
        health.put("disk", disk);

        return ResponseEntity.ok(health);
    }
}
