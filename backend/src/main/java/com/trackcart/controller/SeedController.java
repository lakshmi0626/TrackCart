package com.trackcart.controller;

import com.trackcart.service.DataSeederService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/seed")
@Tag(name = "Data Seeder", description = "Reset and populate database with enterprise demo records")
public class SeedController {

    private final DataSeederService seederService;

    public SeedController(DataSeederService seederService) {
        this.seederService = seederService;
    }

    @PostMapping("/reset")
    @Operation(summary = "Reset and re-seed sample users, shipments, orders, and complaints")
    public ResponseEntity<Map<String, String>> resetSeedData() {
        seederService.seedDatabase();
        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Database successfully re-seeded with demo orders, shipments, users and complaints."
        ));
    }
}
