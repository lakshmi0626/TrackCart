package com.trackcart.controller;

import com.trackcart.dto.ComplaintRequest;
import com.trackcart.dto.ComplaintResponse;
import com.trackcart.model.ComplaintStatus;
import com.trackcart.service.ComplaintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@Tag(name = "Complaints & Support", description = "Ticket logging, investigation lifecycle, resolution and customer communications")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping
    @Operation(summary = "Submit a customer support ticket or order complaint")
    public ResponseEntity<ComplaintResponse> createComplaint(@Valid @RequestBody ComplaintRequest request) {
        return ResponseEntity.ok(complaintService.createComplaint(request));
    }

    @GetMapping
    @Operation(summary = "Get tickets (Customer sees their own, Admin sees all)")
    public ResponseEntity<List<ComplaintResponse>> getComplaints() {
        return ResponseEntity.ok(complaintService.getComplaintsForCurrentUser());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get complaint details by ticket ID")
    public ResponseEntity<ComplaintResponse> getComplaintById(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.getComplaintById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin endpoint to investigate and resolve support ticket")
    public ResponseEntity<ComplaintResponse> updateComplaint(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        ComplaintStatus status = ComplaintStatus.valueOf(body.get("status"));
        String resolutionNotes = body.get("resolutionNotes");
        return ResponseEntity.ok(complaintService.updateComplaintStatus(id, status, resolutionNotes));
    }
}
