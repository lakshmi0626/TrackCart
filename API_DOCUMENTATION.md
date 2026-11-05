# TrackCart – REST API Specification

Interactive Swagger UI is available at: `http://localhost:8080/swagger-ui.html`
OpenAPI JSON format: `http://localhost:8080/api-docs`

Base URL: `/api`

All authenticated endpoints require the header:
```http
Authorization: Bearer <your-jwt-token>
```

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new customer or delivery partner account.
- **Request Body**:
  ```json
  {
    "email": "sarah@example.com",
    "password": "Password@123",
    "fullName": "Sarah Jenkins",
    "phone": "+1-555-0188",
    "role": "CUSTOMER",
    "shippingAddress": "188 Orchard Avenue",
    "city": "Seattle",
    "state": "WA",
    "postalCode": "98101"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "id": 2,
    "email": "sarah@example.com",
    "fullName": "Sarah Jenkins",
    "role": "CUSTOMER"
  }
  ```

### `POST /api/auth/login`
Authenticates user and returns JWT token.
- **Request Body**:
  ```json
  {
    "email": "customer@trackcart.io",
    "password": "Customer@123"
  }
  ```
- **Response (200 OK)**: Returns AuthResponse with Bearer token.

### `GET /api/auth/me`
Retrieves currently authenticated user profile.

---

## 2. Order Management

### `POST /api/orders`
Creates a new multi-item order, generates shipment, logs initial tracking milestone, and creates tax invoice.
- **Request Body**:
  ```json
  {
    "items": [
      {
        "productName": "Sony WH-1000XM5 Wireless Headphones",
        "sku": "SNY-WH-XM5",
        "unitPrice": 349.99,
        "quantity": 1
      }
    ],
    "shippingAddress": "42 Tech Blvd",
    "city": "San Francisco",
    "state": "CA",
    "postalCode": "94105",
    "deliveryNotes": "Leave at front desk",
    "paymentMethod": "CREDIT_CARD"
  }
  ```
- **Response (200 OK)**: Returns `OrderResponse` including `orderNumber`, `trackingNumber`, and calculated totals.

### `GET /api/orders`
Returns list of orders based on authenticated role:
- `ADMIN`: all system orders.
- `CUSTOMER`: orders placed by authenticated user.
- `DELIVERY_PARTNER`: shipments assigned to driver.

### `GET /api/orders/{id}`
Returns details for a single order.

### `PUT /api/orders/{id}/cancel`
Cancels an order if eligible (before it has shipped), issues refund, and marks shipment `FAILED/CANCELLED`.

### `GET /api/orders/{id}/invoice`
Returns a formatted, printable HTML/PDF tax invoice document.

---

## 3. Intelligent Shipment & Tracking

### `GET /api/shipments/track/{trackingNumber}` (Public)
Publicly accessible lookup for intelligent tracking timeline by tracking number (e.g. `TRK-TC-DEMO01`) or order reference (`TC-ORD-2026-8812`).
- **Response (200 OK)**:
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

### `GET /api/delivery-partners/my-assignments`
Returns active and historical delivery shipments assigned to this courier.

### `PUT /api/delivery-partners/availability`
Toggles online availability state (`{"isAvailable": true}`).

### `PUT /api/delivery-partners/location`
Pushes live GPS coordinates (`{"lat": 37.7749, "lng": -122.4194}`).

---

## 5. Support & Complaints

### `POST /api/complaints`
Logs a new customer support ticket.
- **Request Body**:
  ```json
  {
    "orderId": 5,
    "subject": "Delivery past scheduled window",
    "description": "Package delayed by over 24 hours.",
    "priority": "HIGH"
  }
  ```

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

## 7. Diagnostics, Coupons & Data Exports (v1.1.0)

### `GET /api/health`
Public liveness and diagnostics probe returning JVM memory, disk space, and database connection status.

### `POST /api/coupons/validate`
Validates promotional discount codes (`WELCOME10`, `TRACK20`) against current cart subtotal.

### `POST /api/orders/{id}/rate` *(Customer Only)*
Submits courier feedback (1-5 stars) and dynamically recalculates delivery partner moving average rating.

### `GET /api/analytics/export/orders/csv` *(Admin Only)*
Streams all platform order records as a formatted CSV attachment.

### `GET /api/analytics/export/audit-logs/csv` *(Admin Only)*
Streams immutable compliance audit event logs as a formatted CSV attachment.
