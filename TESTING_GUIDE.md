# TrackCart – Testing & Quality Assurance Guide

This guide covers automated testing, test suites, manual verification flows, and CI/CD validation.

---

## 1. Automated Test Execution

### Backend Automated Tests (JUnit 5 + Mockito)
```powershell
cd C:\Users\HP\.gemini\antigravity\scratch\TrackCart\backend

# Execute domain verification tests
mvn test -Dtest=TrackCartDomainTest -o
```

**Test Coverage Highlights**:
- `testOrderCalculationAndItemSubtotals`: Verifies subtotal summation, tax calculation (18%), free shipping threshold ($100), and final amounts.
- `testShipmentMilestoneProgressStages`: Verifies sequential index mapping across all 6 tracking stages (`MANIFESTED` -> `DELIVERED`).
- `testDelayedShipmentDetection`: Verifies deadline comparator detects overdue packages and triggers delay flags.
- `testJwtTokenProviderCycle`: Verifies HS256 token generation, signature validation, and claims parsing.
- `testUserRoleAndPrivileges`: Tests role assignments across `ADMIN`, `CUSTOMER`, and `DELIVERY_PARTNER`.
- `testComplaintTicketEscalation`: Verifies ticket priorities (`URGENT`, `HIGH`) and resolution timestamps.

### Frontend Automated Verification Suite
```powershell
cd C:\Users\HP\.gemini\antigravity\scratch\TrackCart\frontend

# Execute frontend automated assertions
npm test
```
**Test Coverage Highlights**:
- Checks existence of compiled production assets in `dist/`.
- Verifies integrity of CSS stylesheets and JavaScript bundle chunks.
- Validates that `api.js` client exports all REST interfaces (`auth`, `orders`, `shipments`, `deliveryPartners`, `complaints`, `analytics`, `notifications`, `seed`).
- Verifies that all 23 application views, dashboards, and layouts exist on disk.

### Frontend Production Build Test
```powershell
cd C:\Users\HP\.gemini\antigravity\scratch\TrackCart\frontend

# Run production compilation
npm run build
```
Result: Zero TypeScript/JSX syntax errors, optimal bundle chunking under 350kB gzipped.

---

## 2. End-to-End Workflow Testing Scenarios

### Scenario A: Order Creation to Live Tracking (Customer Role)
1. Navigate to `http://localhost:5173/login`.
2. Click **Customer (John Doe)** to log in instantly.
3. Click **Place New Order** or navigate to `/customer/create-order`.
4. Add items from the catalog (e.g. *Sony WH-1000XM5*, *Dell 4K Monitor*).
5. Click **Confirm & Dispatch Order**.
6. **Expected Outcome**: Order is created, payment processed, and user is immediately redirected to `/track?id=TRK-TC-...` showing stage 1 (`CONFIRMED`).

### Scenario B: Dispatch & Delivery Lifecycle (Partner Role)
1. Use the top navbar demo switcher to select **Partner (Marcus Vance)**.
2. Navigate to **Assigned Deliveries** (`/partner/deliveries`).
3. Click **Mark Picked Up** on an assigned shipment.
4. Click **Out For Delivery** as the parcel moves into the final mile.
5. Click **Confirm Drop-off**, enter recipient signature note, and submit.
6. **Expected Outcome**: Shipment status updates to `DELIVERED`, partner completed deliveries count increments, and payout increases.

### Scenario C: Delayed Shipment Detection (Admin Role)
1. Switch to **Admin** role via the navbar demo switcher.
2. Navigate to `/admin/shipments`.
3. Filter by **Filter Delayed Shipments**.
4. Notice `TRK-TC-DEMO05` highlighted in red with *DELAYED* status and weather incident notes.
5. Open `/track?id=TRK-TC-DEMO05` to view the high-visibility warning banner.
6. Return to Admin, open **Update**, and transition to `OUT_FOR_DELIVERY` to clear the incident.
