package com.trackcart.util;

public final class GeoUtils {

    private static final double EARTH_RADIUS_KM = 6371.0;
    private static final double AVERAGE_URBAN_SPEED_KMH = 30.0;

    private GeoUtils() {}

    /**
     * Calculates geodesic distance in kilometers between two lat/lon coordinates
     * using the Haversine formula.
     */
    public static double calculateHaversineDistanceMiles(double lat1, double lon1, double lat2, double lon2) {
        return calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) * 0.621371;
    }

    public static double calculateHaversineDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    /**
     * Computes estimated travel time in minutes based on distance and average transit velocity.
     */
    public static int estimateTravelTimeMinutes(double distanceKm) {
        if (distanceKm <= 0) return 0;
        double hours = distanceKm / AVERAGE_URBAN_SPEED_KMH;
        return (int) Math.ceil(hours * 60.0);
    }

    /**
     * Checks if coordinates fall within geofence radius.
     */
    public static boolean isWithinGeofence(double lat1, double lon1, double lat2, double lon2, double radiusKm) {
        return calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) <= radiusKm;
    }
}
