# TrackCart – Setup & Execution Guide

This guide provides instructions to run, configure, and operate **TrackCart** on Windows, macOS, or Linux.

---

## 1. Prerequisites

Verify installed tools:
```powershell
java -version       # Java JDK 17, 21, or 26
mvn -v              # Apache Maven 3.8+
node -v             # Node.js 18+
npm -v              # npm 9+
git --version       # Git 2.30+
```

---

## 2. Running Locally Without Docker

TrackCart includes an automated in-memory PostgreSQL-compatible database fallback, meaning you can start and test the full application immediately without installing or running a local PostgreSQL database server!

### Step 1: Start Backend (Spring Boot 3)
```powershell
# Navigate to TrackCart backend
cd C:\Users\HP\.gemini\antigravity\scratch\TrackCart\backend

# Run with Maven
mvn spring-boot:run
```
Expected output:
```text
2026-11-05 ... : Started TrackCartApplication in 4.5 seconds (process running for 5.1)
```
- Server URL: `http://localhost:8080`
- Swagger UI Documentation: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/api-docs`

### Step 2: Start Frontend (React + Vite)
In a separate terminal:
```powershell
# Navigate to TrackCart frontend
cd C:\Users\HP\.gemini\antigravity\scratch\TrackCart\frontend

# Start Vite dev server
npm run dev
```
Expected output:
```text
  VITE v5.4.7  ready in 450 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```
- Open `http://localhost:5173` in your browser.

---

## 3. Running with Docker Compose (PostgreSQL 16)

To test the application in an isolated containerized environment:

```powershell
cd C:\Users\HP\.gemini\antigravity\scratch\TrackCart

# Build and start all 3 services: postgres, backend, frontend
docker compose up --build
```

Services started:
- `trackcart-postgres` on port `5432`
- `trackcart-backend` on port `8080`
- `trackcart-frontend` on port `3000` (Nginx reverse proxy)

To run in the background:
```powershell
docker compose up -d
```
To shut down containers and clean volumes:
```powershell
docker compose down -v
```

---

## 4. Environment Variables Reference

Copy `.env.example` to `.env` to customize settings:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `SERVER_PORT` | `8080` | Spring Boot HTTP port |
| `SPRING_PROFILES_ACTIVE` | `dev` | Profile (`dev` for H2, `prod` for PostgreSQL) |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `trackcart_db` | Database catalog name |
| `DB_USER` | `trackcart_user` | Database user |
| `DB_PASSWORD` | `trackcart_password` | Database password |
| `JWT_SECRET` | `c7b203c...` | 256-bit HMAC secret key |
| `JWT_EXPIRATION_MS` | `86400000` | Token validity (24 hours) |
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | Frontend API proxy |

---

## 5. Troubleshooting & Diagnostics

- **Port 8080 or 5173 occupied**:
  Pass a custom port: `mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8090"`.
- **Reset Demo Records**:
  If test mutations need to be cleaned up, click the reset icon on the top navigation bar or execute:
  ```powershell
  Invoke-RestMethod -Uri http://localhost:8080/api/seed/reset -Method POST
  ```
