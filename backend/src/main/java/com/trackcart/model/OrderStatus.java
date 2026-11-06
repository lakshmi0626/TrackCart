package com.trackcart.model;

/**
 * Lifecycle progression states for consumer purchase orders.
 */
public enum OrderStatus {
    /** Order registered by customer, awaiting payment validation. */
    PENDING,
    /** Payment authorized, order queued for fulfillment dispatch. */
    CONFIRMED,
    /** Items packaged in regional fulfillment center. */
    PROCESSING,
    /** Parcel handed over to delivery logistics carrier. */
    SHIPPED,
    /** Assigned courier has parcel out on final delivery leg. */
    OUT_FOR_DELIVERY,
    /** Successfully handed over to recipient customer. */
    DELIVERED,
    /** Order cancelled prior to carrier dispatch. */
    CANCELLED
}
