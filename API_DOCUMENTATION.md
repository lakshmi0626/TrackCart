# TrackCart Enterprise REST API Specification

[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0-6BA539.svg)](http://localhost:8080/swagger-ui.html)
[![Swagger](https://img.shields.io/badge/Swagger-UI-85EA2D.svg)](http://localhost:8080/swagger-ui.html)

Comprehensive interface documentation for the **TrackCart** logistics, shipment tracking, and order fulfillment platform.

**Base URL**: `http://localhost:8080/api`  
**Swagger UI**: `http://localhost:8080/swagger-ui.html`  
**OpenAPI JSON**: `http://localhost:8080/api-docs`  
**Version**: `1.2.0`

---

## Security Response Headers (v1.2.0)
All API endpoints enforce OWASP-compliant security response headers via `SecurityHeadersFilter`:
- `X-Content-Type-Options`: `nosniff`
- `X-Frame-Options`: `SAMEORIGIN`
- `X-XSS-Protection`: `1; mode=block`
- `Referrer-Policy`: `strict-origin-when-cross-origin`
- `Permissions-Policy`: `camera=(), microphone=(), geolocation=(self)`

---

## 1. Authentication & Security

### `POST /api/auth/register`
Creates a new customer or partner driver account.
- **Request Body**:
  ```json
  {
    "fullName": "Sarah Connor",
    "email": "sarah@cyberdyne.io",
    "password": "Password@123",
    "phoneNumber": "+1-415-555-0199",
    "role": "CUSTOMER"
  }
  ```
- **Response `(200 OK)`**: Returns JWT session token and user profile summary.

### `POST /api/auth/login`
Authenticates credentials and generates a signed JWT token (24-hour expiration).
- **Request Body**:
  ```json
  {
    "email": "customer@trackcart.io",
    "password": "Password@123"
  }
  ```
- **Response `(200 OK)`**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": 2,
    "email": "customer@trackcart.io",
    "fullName": "John Customer",
    "phoneNumber": "+1-555-0102",
    "role": "CUSTOMER"
  }
  ```

---

## 2. Order Management

### `POST /api/orders` *(Customer Only)*
Creates a new purchase order with multiple items, subtotal calculation, 18% tax, and shipping fees.
- **Request Body**:
  ```json
  {
    "shippingAddress": "742 Evergreen Terrace",
    "city": "Springfield",
    "state": "OR",
    "postalCode": "97477",
    "items": [
      { "productName": "Ergonomic Mechanical Keyboard", "quantity": 1, "unitPrice": 129.99 },
      { "productName": "Wireless Precision Mouse", "quantity": 2, "unitPrice": 49.50 }
    ]
  }
  ```
- **Behavior**:
  - Automatically initializes tracking number format: `TRK-TC-YYYYMMDD-XXXX`.
  - Automatically manifests initial order event (`ORDER PLACED`).

### `GET /api/orders`
Retrieves all orders matching current user authorization:
- `CUSTOMER`: Views own order catalog.
- `ADMIN`: Views global order roster.

### `GET /api/orders/{id}`
Retrieves single order with line-items, financial totals, and associated shipment details.

### `POST /api/orders/{id}/cancel` *(Customer Only)*
Cancels an unfulfilled order prior to dispatch (`CONFIRMED` or `PENDING` states). Dispatches customer alert and generates an audit log entry.

### `GET /api/orders/{id}/invoice`
Generates and serves a formatted, printable official tax invoice with company tax IDs and digital signature stamp.

---

## 3. Shipment Milestones & Real-Time Tracking

### `GET /api/shipments/track/{trackingNumber}` *(Public)*
Returns public live tracking milestones, transit timeline, and driver details for customer parcel lookups.
- **Response `(200 OK)`**:
  ```json
  {
    "id": 1,
    "trackingNumber": "TRK-TC-DEMO01",
    "orderNumber": "TC-ORD-2026-8812",
    "status": "DELIVERED",
    "currentStage": 5,
    "carrierName": "TrackCart Express",
    "isDelayed": false,
    "partnerName": "Marcus Vance",
    "partnerPhone": "+1-555-0177",
    "events": [
      {
        "status": "MANIFESTED",
        "location": "San Francisco",
        "description": "Order placed and authorized.",
        "actorRole": "CUSTOMER",
        "eventTimestamp": "2026-11-01T08:00:00Z"
      },
      {
        "status": "DELIVERED",
        "location": "Front Door",
        "description": "Delivered and signed by recipient.",
        "actorRole": "DELIVERY_PARTNER",
        "eventTimestamp": "2026-11-01T16:30:00Z"
      }
    ]
  }
  ```

### `PUT /api/shipments/{id}/status`
Updates status milestone, appends tracking event, updates order lifecycle, and dispatches customer notification.
- **Request Body**:
  ```json
  {
    "status": "OUT_FOR_DELIVERY",
    "location": "San Francisco Local Hub",
    "description": "Out with driver for delivery",
    "isDelayed": false
  }
  ```

### `POST /api/shipments/{id}/assign` *(Admin Only)*
Assigns a delivery partner to an unassigned shipment.
- **Request Body**: `{"partnerId": 1}`

---

## 4. Delivery Partner Operations

### `GET /api/delivery-partners/me`
Retrieves authenticated partner driver profile, vehicle specs, and rating.

### `PUT /api/delivery-partners/status`
Toggles partner availability (`AVAILABLE` vs `OFFLINE`).

### `GET /api/delivery-partners/my-deliveries`
Returns active shipments assigned to the logged-in courier.

### `GET /api/delivery-partners/my-history`
Returns completed shipments, timestamps, and accrued courier fees.

---

## 5. Support & Ticket Triage

### `POST /api/complaints` *(Customer Only)*
Submits an issue regarding an order, damaged item, or delivery delay.

### `GET /api/complaints`
Returns tickets (customer sees own tickets, admin sees all).

### `PUT /api/complaints/{id}` *(Admin Only)*
Updates ticket status (`INVESTIGATING`, `RESOLVED`, `CLOSED`) and records remediation notes.

---

## 6. Analytics & Audit Trails

### `GET /api/analytics/admin-summary` *(Admin Only)*
Returns operational statistics: total orders, gross revenue, pending pipeline, delayed ratio, status distribution map, and recent orders.

### `GET /api/analytics/partner-summary`
Returns driver's active assignments, completed deliveries, rating, and accrued earnings.

### `GET /api/analytics/audit-logs` *(Admin Only)*
Returns last 50 immutable system events with actors and timestamps.

### `POST /api/seed/reset`
Restores the database with clean demonstration data across all three roles.

---

## 7. Diagnostics, Coupons & Data Exports (v1.2.0)

### `GET /api/health`
Public liveness and diagnostics probe returning JVM memory, active threads, disk space, and database connection status.

### `GET /api/health/ping`
Lightweight Kubernetes readiness/liveness ping endpoint returning service health status and timestamp.

### `POST /api/coupons/validate`
Validates promotional discount codes (`WELCOME10`, `TRACK20`) against current cart subtotal.

### `POST /api/orders/{id}/rate` *(Customer Only)*
Submits courier feedback (1-5 stars) and dynamically recalculates delivery partner moving average rating.

### `GET /api/analytics/export/orders/csv` *(Admin Only)*
Streams all platform order records as a formatted CSV attachment.

### `GET /api/analytics/export/audit-logs/csv` *(Admin Only)*
Streams immutable compliance audit event logs as a formatted CSV attachment.

---

## 8. Error Codes & Problem Details (RFC 7807)

| HTTP Status | Error Code | Description |
| :--- | :--- | :--- |
| **400** | `VALIDATION_ERROR` | Malformed input or invalid payload constraints |
| **401** | `UNAUTHORIZED` | Missing or expired JWT bearer token |
| **403** | `FORBIDDEN` | Insufficient RBAC role privileges |
| **404** | `RESOURCE_NOT_FOUND` | Requested order, tracking ID, or partner not found |
| **429** | `RATE_LIMIT_EXCEEDED` | Client exceeded 120 requests/minute threshold |
| **500** | `INTERNAL_SERVER_ERROR` | Unhandled server exception with UUID trace reference |
