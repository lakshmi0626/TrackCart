# Changelog

All notable changes to **TrackCart** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.3.0] - 2026-11-06

### Added (35 Official GitHub Pull Requests Completed)
- **35 Verified GitHub Pull Requests** created and merged via GitHub API on https://github.com/lakshmi0626/TrackCart.
- Hardened Docker build contexts with root, backend, and frontend `.dockerignore` configurations.
- Standardized cross-IDE formatting with `.editorconfig` and line normalization with `.gitattributes`.
- Added dedicated 404 `NotFoundPage.jsx` and accessible `LoadingSkeleton.jsx` shimmer placeholders.
- Enhanced `StatusBadge.jsx` with WAI-ARIA role="status" and real-time screen reader attributes.
- Added cross-tab dark mode theme synchronization via window `storage` events in `ThemeContext.jsx`.
- Added geodesic distance calculation in statute miles in `GeoUtils.java` with automated unit tests.
- Exposed peak thread count and garbage collector diagnostics in `/api/health`.
- Added Postman API collection template and comprehensive RFC 7807 error codes reference catalog.

---

## [1.2.0] - 2026-11-06

### Added (35 Enterprise Pull Requests Completed)
- **PR #31**: CI/CD GitHub Actions setup-node caching resolution (`frontend/package-lock.json`), build step sequencing, and async test runner hardening.
- **PR #32**: Application-wide dark mode theme state management (`ThemeContext`), local storage persistence, and header toggle switch.
- **PR #33**: Reusable `StatusBadge` component featuring animated pulsing status indicators and accessible styling across Customer and Admin order tables.
- **PR #34**: Enterprise OWASP security headers filter (`SecurityHeadersFilter`) protecting against MIME-sniffing and clickjacking, with full automated test suite (`SecurityHeadersFilterTest`).
- **PR #35**: Advanced telemetry metrics in `HealthCheckController` (`/api/health/ping`, JVM heap utilization, active threads) and v1.2.0 production release documentation.

---

## [1.1.0] - 2026-11-05

### Added (30 Enterprise Pull Requests Completed)
- **PR #14**: Health Check and Actuator Diagnostics (`/api/health`) monitoring JVM memory, disk space, and database connection.
- **PR #15**: IP-based request rate limiting filter (`RateLimitFilter`) mitigating brute-force and DDoS risks (120 req/min).
- **PR #16**: Order reporting CSV stream export (`/api/analytics/export/orders/csv`) and Admin portal download trigger.
- **PR #17**: Asynchronous transactional email dispatch service (`EmailService`) for order and delivery lifecycle alerts.
- **PR #18**: Promotional coupon engine with `Coupon` entity, validation API (`/api/coupons/validate`), and checkout discount calculations (`WELCOME10`, `TRACK20`).
- **PR #19**: Dynamic multi-criteria order sorting and full-text search across Admin and Customer order tables.
- **PR #20**: Haversine geodesic distance and transit ETA telemetry utility (`GeoUtils`) with live courier proximity indicators.
- **PR #21**: External SMS webhook notification dispatcher (`SmsWebhookService`) for Twilio/gateway carrier integrations.
- **PR #22**: Profile identity customizer with multi-tone avatar palette selector and persistent state.
- **PR #23**: Delivery partner rating and performance evaluation endpoint (`POST /api/orders/{id}/rate`) with cumulative score re-computation.
- **PR #24**: Cryptographic digital verification stamp with SHA-256 doc authentication hashes embedded in tax invoices.
- **PR #25**: Standardized RFC 7807 problem details error handling (`GlobalExceptionHandler`) with UUID trace IDs and validation maps.
- **PR #26**: Global reactive floating Toast notification system (`ToastContext`) replacing native browser popups.
- **PR #27**: Immutable compliance audit trail CSV export (`/api/analytics/export/audit-logs/csv`).
- **PR #28**: Real-time visual password strength and complexity meter in user registration.
- **PR #29**: Automated integration test suite (`CouponServiceTest`) expanding automated test coverage to 12 passing tests.
- **PR #30**: Production readiness documentation polish and OpenAPI specifications.

---

## [1.0.0] - 2026-11-05

### Added
- **Core Architecture**:
  - Initialized Git repository with Gitflow branch model (`main`, `develop`, and `feature/*` branches).
  - Configured multi-container `docker-compose.yml` with PostgreSQL 16, Spring Boot 3, and React Vite Nginx.
  - Configured GitHub Actions CI/CD pipeline (`.github/workflows/ci.yml`).
- **Security & User Management**:
  - Implemented JWT token authentication (JJWT 0.12.5) with BCrypt password encryption.
  - Implemented Role-Based Access Control (RBAC) across `ADMIN`, `CUSTOMER`, and `DELIVERY_PARTNER`.
  - Added instant demo role switcher on navigation bar.
- **Intelligent Tracking System**:
  - 6-stage shipment lifecycle pipeline: ORDER PLACED → CONFIRMED → PACKED → SHIPPED → OUT FOR DELIVERY → DELIVERED.
  - Automated background overdue delay detector with `@Scheduled` monitor.
  - Comprehensive milestone timeline history logging actor roles, event timestamps, and locations.
- **Order Management & Invoicing**:
  - Customer multi-item order placement with subtotal, 18% tax calculation, and free shipping logic.
  - Pre-dispatch order cancellation with automated refund workflow.
  - Printable official HTML/PDF tax invoice generator.
- **Delivery Partner Logistics**:
  - Driver terminal with availability toggle (Online vs. Offline).
  - One-click sequential status transitions: Picked Up, Out for Delivery, Delivered with notes, and Delay reporting.
  - Completed deliveries history with accrued earnings calculation ($15.50 / delivery).
- **Admin Command Center**:
  - Real-time operations KPIs: Total orders, gross revenue, pending pipeline, delivered and delayed shipments.
  - Driver dispatch assignment modal.
  - Customer directory and delivery fleet rosters.
  - Support ticket triage and resolution notes logging.
  - Printable executive logistics report and immutable system audit logs.
- **Testing & Verification**:
  - Comprehensive JUnit 5 backend tests (`TrackCartDomainTest`) verifying business rules.
  - Automated frontend test runner verifying production bundle, assets, and REST API interfaces.
