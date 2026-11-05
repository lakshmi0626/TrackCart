# Changelog

All notable changes to **TrackCart** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
