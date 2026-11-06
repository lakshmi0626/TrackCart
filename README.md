# TrackCart – Intelligent Order & Delivery Tracking Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Java](https://img.shields.io/badge/Java-21%20LTS-ED8B00.svg)]()
[![Docker](https://img.shields.io/badge/Docker-Compose%20v2-2496ED.svg)]()
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)]()
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)]()
[![Vite](https://img.shields.io/badge/Vite-5.4.7-646CFF.svg)]()
[![License](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%7C%20H2-336791.svg)]()

> **TrackCart** is a modern, enterprise-grade logistical SaaS application designed for real-time order lifecycle tracking, intelligent delivery route dispatching, and automated dispute resolution across **Admin**, **Customer**, and **Delivery Partner** roles.

---

## 🌟 Key Features

### 1. Intelligent 6-Stage Tracking Timeline
Visual, animated milestone progression:
$$\text{ORDER PLACED} \longrightarrow \text{CONFIRMED} \longrightarrow \text{PACKED} \longrightarrow \text{SHIPPED} \longrightarrow \text{OUT FOR DELIVERY} \longrightarrow \text{DELIVERED}$$
- **Automated Delay Detection**: Active scheduled background monitor compares actual delivery progress against estimated arrival deadlines and triggers delay flags with root-cause incident notes.
- **Milestone Audit Trail**: Every status transition logs event timestamp, facility coordinates/location, and acting actor role.
- **Courier Telemetry**: Driver contact details, assigned vehicle specifications, and live status.

### 2. Multi-Role Ecosystem
- **Customer Portal**:
  - Interactive product catalog & multi-item shopping checkout.
  - Live order tracking by tracking ID or order reference.
  - Printable official Tax Invoice generator with complete tax (GST) and line item breakdowns.
  - Customer complaint / dispute logging with order linking.
  - Instant order cancellation for eligible pre-dispatch orders.
- **Admin Command Center**:
  - Operational KPIs: Total Orders, Gross Sales, Pending Pipeline, Delivered Shipments, Delayed Shipments, and Support Tickets.
  - One-click courier dispatch assignment modal.
  - Shipment status milestone override controls with delay reason flagging.
  - Customer directory & delivery partner fleet rosters.
  - Support ticket triage and resolution notes logging.
  - Executive Printable Report and immutable system audit logs.
- **Delivery Partner Driver Terminal**:
  - Driver availability toggle (Online/Available vs. Offline).
  - Assigned delivery queue with one-click sequential status transitions:
    - *Mark as Picked Up*
    - *Mark as Out for Delivery*
    - *Confirm Drop-off (with recipient signature/notes)*
    - *Report Delay Incident*
  - Completed deliveries history with accrued payout tracking ($15.50 / fulfilled drop).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Tailwind CSS, Lucide Icons, React Router v6 |
| **Backend** | Java 21 / 26, Spring Boot 3.3.4, Spring Security, Spring Data JPA |
| **Security** | JWT (JSON Web Tokens via JJWT 0.12.5), BCrypt Password Hashing, RBAC |
| **Database** | PostgreSQL 16 (production/docker), Embedded H2 (development zero-friction fallback) |
| **Deployment** | Docker, Docker Compose, Nginx Reverse Proxy, GitHub Actions CI/CD |
| **Testing** | JUnit 5, Mockito, Spring Boot Test, Custom Node.js Production Verifier |

---

## 🚀 Quick Start (Running Locally)

### Prerequisites
- Java JDK 17, 21, or 26
- Apache Maven 3.8+
- Node.js 18+ & npm

### 1. Start the Backend API
```powershell
# Navigate to the backend directory
cd backend

# Compile, test, and run Spring Boot
mvn spring-boot:run
```
*The Spring Boot server will initialize on `http://localhost:8080` with embedded database and automated demo seed data!*
*API Documentation (Swagger UI): `http://localhost:8080/swagger-ui.html`*

### 2. Start the Frontend Client
```powershell
# Navigate to the frontend directory
cd frontend

# Start Vite development server
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

## 👥 Instant Demo Credentials

The application includes an instant **Demo Role Switcher** on the top navigation bar, or you can sign in manually with these accounts:

| Role | Email | Password | Pre-seeded Scenario |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@trackcart.io` | `Admin@123` | Full operations command center, driver assignment, analytics |
| **Customer** | `customer@trackcart.io` | `Customer@123` | Active shipments, order placement, invoice downloads |
| **Delivery Partner** | `partner@trackcart.io` | `Partner@123` | Active driver queue, status transitions, earnings ledger |

*To restore or refresh the demo dataset at any time, click the **Reset Demo Data** icon in the navigation bar or execute `POST /api/seed/reset`.*

---

## 🐳 Docker Containerization

To run the entire multi-container stack (PostgreSQL + Spring Boot + React + Nginx):
```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

---

## 📖 Project Documentation Index

- [Project Architecture & System Design](PROJECT_ARCHITECTURE.md)
- [Database Schema & Migrations](DATABASE_SCHEMA.md)
- [REST API Documentation](API_DOCUMENTATION.md)
- [Setup & Environment Guide](SETUP_GUIDE.md)
- [Testing & Quality Assurance Guide](TESTING_GUIDE.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)

<!-- pr-22-meta -->
