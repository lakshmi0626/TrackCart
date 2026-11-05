package com.trackcart.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class GeoUtilsTest {

    @Test
    @DisplayName("Should accurately calculate distance between San Francisco and Oakland")
    void testHaversineDistance() {
        // San Francisco (37.7749, -122.4194) to Oakland (37.8044, -122.2712) ~ 13.5 km
        double distance = GeoUtils.calculateHaversineDistanceKm(37.7749, -122.4194, 37.8044, -122.2712);
        assertTrue(distance > 12.0 && distance < 15.0, "Expected distance between 12 and 15 km, got " + distance);
    }

    @Test
    @DisplayName("Should estimate reasonable travel time in minutes")
    void testEstimateTravelTimeMinutes() {
        // 15 km at 30 km/h should be 30 minutes
        int minutes = GeoUtils.estimateTravelTimeMinutes(15.0);
        assertEquals(30, minutes);
    }

    @Test
    @DisplayName("Should verify proximity geofence radius check")
    void testGeofenceProximity() {
        boolean inside = GeoUtils.isWithinGeofence(37.7749, -122.4194, 37.7750, -122.4190, 1.0);
        assertTrue(inside);

        boolean outside = GeoUtils.isWithinGeofence(37.7749, -122.4194, 38.5816, -121.4944, 10.0);
        assertFalse(outside);
    }
}
