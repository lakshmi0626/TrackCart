package com.trackcart.controller;

import com.trackcart.model.Notification;
import com.trackcart.model.User;
import com.trackcart.repository.NotificationRepository;
import com.trackcart.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "Real-time user alerts, shipment updates, and notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final AuthService authService;

    public NotificationController(NotificationRepository notificationRepository, AuthService authService) {
        this.notificationRepository = notificationRepository;
        this.authService = authService;
    }

    @GetMapping
    @Operation(summary = "Get list of notifications for the authenticated user")
    public ResponseEntity<List<Notification>> getNotifications() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(notificationRepository.findByUserOrderByCreatedAtDesc(user));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        Notification notification = notificationRepository.findById(id).orElse(null);
        if (notification != null) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
        return ResponseEntity.ok(notification);
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all notifications as read for current user")
    public ResponseEntity<Map<String, String>> markAllAsRead() {
        User user = authService.getCurrentUser();
        List<Notification> unread = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        for (Notification n : unread) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(unread);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}
