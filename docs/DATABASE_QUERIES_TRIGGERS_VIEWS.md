# Database Queries, Triggers & Views Documentation

## Hotel Management System — "The Grand Girvan Palace"

This document provides a comprehensive text description of all the SQL queries, trigger-like transactional logic, and view-like analytical queries implemented across the Hotel Management System database layer. The backend uses **MySQL** as the RDBMS, accessed through the `mysql2/promise` driver in a Node.js (Express) server.

> **Note:** The system does not define standalone SQL `CREATE VIEW` or `CREATE TRIGGER` statements in the DDL schema. Instead, equivalent functionality is implemented as **application-level transactional logic** (using explicit `BEGIN TRANSACTION` / `COMMIT` / `ROLLBACK` blocks) and **complex analytical JOIN queries** that serve the same purpose as database views. These are documented in full below.

---

## Table of Contents

1. [Authentication & User Lookup Queries](#1-authentication--user-lookup-queries)
2. [Room & Property Queries](#2-room--property-queries)
3. [Reservation Queries](#3-reservation-queries)
4. [Housekeeping Queries](#4-housekeeping-queries)
5. [Spa & Wellness Service Queries](#5-spa--wellness-service-queries)
6. [Staff, Guest & Invoice Queries (View-Like)](#6-staff-guest--invoice-queries-view-like)
7. [Analytics & Dashboard Queries (View-Like)](#7-analytics--dashboard-queries-view-like)
8. [Transactional Logic (Trigger-Like Behavior)](#8-transactional-logic-trigger-like-behavior)
9. [Seed & Data Population Queries](#9-seed--data-population-queries)
10. [Indexes for Query Optimization](#10-indexes-for-query-optimization)

---

## 1. Authentication & User Lookup Queries

### 1.1 Staff Login Query

**Purpose:** Authenticates a staff member by email. Performs a multi-table LEFT JOIN to retrieve the staff record along with any role-specialization data (Receptionist shift info, Manager department info, or Therapist specialty) in a single query.

```sql
SELECT s.*,
       r.Shift_Timing, r.Desk_Extension,
       m.Department_Managed, m.Office_Number,
       t.Therapist_ID, t.Specialty
FROM Staff s
LEFT JOIN Receptionist r ON s.Staff_ID = r.Staff_ID
LEFT JOIN Manager m ON s.Staff_ID = m.Staff_ID
LEFT JOIN Therapist t ON s.Staff_ID = t.Staff_ID
WHERE s.Email = ?
```

- **Tables involved:** `Staff`, `Receptionist`, `Manager`, `Therapist`
- **Join type:** LEFT JOIN (since a staff member may only belong to one specialization sub-table)
- **Filter:** Parameterized email match (case-insensitive, trimmed at the application layer)
- **Used by:** `POST /api/auth/login`

### 1.2 Guest Login Query

**Purpose:** Looks up a guest account by email for authentication.

```sql
SELECT * FROM Guest WHERE Email = ?
```

- **Tables involved:** `Guest`
- **Filter:** Parameterized email match
- **Used by:** `POST /api/auth/guest-login`

### 1.3 Guest Duplicate Check (Registration)

**Purpose:** Before registering a new guest, checks whether an account with the given email already exists to enforce the UNIQUE constraint at the application level.

```sql
SELECT Guest_ID FROM Guest WHERE Email = ?
```

- **Tables involved:** `Guest`
- **Used by:** `POST /api/auth/guest-register`

### 1.4 Guest Registration Insert

**Purpose:** Inserts a new guest record with a hashed password, default loyalty tier (Bronze), and active account status.

```sql
INSERT INTO Guest (Guest_ID, First_Name, Last_Name, Email, Password_Hash, Phone,
                   Loyalty_Points, Loyalty_Tier, Account_Status, Special_Requests)
VALUES (?, ?, ?, ?, ?, ?, 0, 'Bronze', 'Active', ?)
```

- **Tables involved:** `Guest`
- **Default values set:** `Loyalty_Points = 0`, `Loyalty_Tier = 'Bronze'`, `Account_Status = 'Active'`
- **Used by:** `POST /api/auth/guest-register`

---

## 2. Room & Property Queries

### 2.1 Get All Rooms with Occupancy Status (View-Like Query)

**Purpose:** Retrieves all rooms enriched with room type details, branch name, current occupant information (if checked-in), and housekeeping status. This query functions as a **virtual view** combining five tables to present a unified room status dashboard.

```sql
SELECT r.Room_ID, r.Room_Number, r.Branch_ID, r.RoomType_ID, r.Housekeeping_Status,
       rt.Name AS TypeName, rt.Base_Capacity, rt.Base_Price AS Rate,
       b.Location_Name,
       res.Reservation_ID, res.Booking_Status,
       CONCAT(g.First_Name, ' ', g.Last_Name) AS Occupant
FROM Rooms r
JOIN RoomType rt ON r.RoomType_ID = rt.RoomType_ID
JOIN Branch b ON r.Branch_ID = b.Branch_ID
LEFT JOIN Reservations res ON r.Room_ID = res.Room_ID
     AND res.Booking_Status = 'Checked-In'
     AND CURRENT_DATE BETWEEN res.Check_In_Date AND res.Check_Out_Date
LEFT JOIN Guest g ON res.Guest_ID = g.Guest_ID
WHERE 1=1
  [AND r.Branch_ID = ?]        -- Optional branch filter
  [AND r.RoomType_ID = ?]      -- Optional room type filter
ORDER BY r.Room_Number ASC
```

- **Tables involved:** `Rooms`, `RoomType`, `Branch`, `Reservations`, `Guest`
- **Join types:** INNER JOIN for type/branch lookups; LEFT JOIN for optional occupancy data
- **Dynamic filters:** Branch ID and Room Type ID are appended conditionally
- **Post-processing:** The application derives a composite `Status` field ('Available', 'Occupied', or 'Maintenance') based on booking status and housekeeping status
- **Used by:** `GET /api/rooms`

### 2.2 Get All Room Amenities

**Purpose:** Retrieves all amenity records to build a room-to-amenities mapping on the application side.

```sql
SELECT Room_ID, Amenity_Name FROM Room_Amenities
```

- **Tables involved:** `Room_Amenities`
- **Used by:** `GET /api/rooms` (merged with room data in application code)

### 2.3 Update Room Housekeeping Status

**Purpose:** Directly updates the housekeeping status field of a specific room.

```sql
UPDATE Rooms SET Housekeeping_Status = ? WHERE Room_ID = ?
```

- **Tables involved:** `Rooms`
- **Used by:** `PATCH /api/rooms/:id/housekeeping`

### 2.4 Get All Room Types

**Purpose:** Retrieves the master list of room type categories, ordered by price.

```sql
SELECT * FROM RoomType ORDER BY Base_Price ASC
```

- **Tables involved:** `RoomType`
- **Used by:** `GET /api/rooms/types`

### 2.5 Get All Branches

**Purpose:** Retrieves all hotel branch locations.

```sql
SELECT * FROM Branch ORDER BY Location_Name ASC
```

- **Tables involved:** `Branch`
- **Used by:** `GET /api/rooms/branches`

---

## 3. Reservation Queries

### 3.1 Get All Reservations with Guest & Invoice Details (View-Like Query)

**Purpose:** Retrieves a comprehensive view of all reservations enriched with guest contact info, room details, room type, and invoice totals. This operates as a **virtual view** joining six tables.

```sql
SELECT res.Reservation_ID, res.Guest_ID, res.Room_ID,
       res.Check_In_Date, res.Check_Out_Date,
       res.Actual_Check_In, res.Actual_Check_Out,
       res.Booking_Status, res.Created_At,
       CONCAT(g.First_Name, ' ', g.Last_Name) AS Guest_Name,
       g.Email AS Guest_Email, g.Phone AS Guest_Phone, g.Loyalty_Tier,
       r.Room_Number, rt.Name AS Room_Type, rt.Base_Price,
       inv.Invoice_ID, inv.Net_Payable AS Total_Amount
FROM Reservations res
JOIN Guest g ON res.Guest_ID = g.Guest_ID
JOIN Rooms r ON res.Room_ID = r.Room_ID
JOIN RoomType rt ON r.RoomType_ID = rt.RoomType_ID
LEFT JOIN Invoice inv ON res.Reservation_ID = inv.Reservation_ID
WHERE 1=1
  [AND r.Branch_ID = ?]            -- Optional branch filter
  [AND res.Booking_Status = ?]     -- Optional status filter
ORDER BY res.Check_In_Date DESC
```

- **Tables involved:** `Reservations`, `Guest`, `Rooms`, `RoomType`, `Invoice`
- **Dynamic filters:** Branch ID and Booking Status are appended conditionally
- **Used by:** `GET /api/reservations`

### 3.2 Find Available Room (Availability Sub-Query)

**Purpose:** Finds a room that is not reserved (excluding cancelled and checked-out bookings) during the requested date range. Uses a correlated `NOT IN` sub-query to check for date overlap conflicts.

```sql
SELECT r.Room_ID, rt.Name, rt.Base_Price
FROM Rooms r
JOIN RoomType rt ON r.RoomType_ID = rt.RoomType_ID
WHERE r.Room_ID NOT IN (
    SELECT Room_ID FROM Reservations
    WHERE Booking_Status NOT IN ('Cancelled', 'Checked-Out')
      AND (? < Check_Out_Date AND ? > Check_In_Date)
)
LIMIT 1
```

- **Tables involved:** `Rooms`, `RoomType`, `Reservations` (sub-query)
- **Logic:** Implements date-range overlap detection — a room is unavailable if `requested_check_in < existing_check_out AND requested_check_out > existing_check_in`
- **Used by:** `POST /api/reservations` (within transaction)

### 3.3 Create Reservation Insert

**Purpose:** Inserts a new reservation record with 'Confirmed' status.

```sql
INSERT INTO Reservations (Reservation_ID, Guest_ID, Room_ID, Check_In_Date, Check_Out_Date, Booking_Status)
VALUES (?, ?, ?, ?, ?, 'Confirmed')
```

- **Tables involved:** `Reservations`
- **Used by:** `POST /api/reservations` (within transaction)

### 3.4 Check-In Update

**Purpose:** Marks a reservation as checked-in and records the actual check-in timestamp.

```sql
UPDATE Reservations
SET Booking_Status = 'Checked-In', Actual_Check_In = CURRENT_TIMESTAMP
WHERE Reservation_ID = ?
```

- **Tables involved:** `Reservations`
- **Used by:** `POST /api/reservations/:id/check-in`

### 3.5 Check-Out Update

**Purpose:** Marks a reservation as checked-out and records the actual check-out timestamp.

```sql
UPDATE Reservations
SET Booking_Status = 'Checked-Out', Actual_Check_Out = CURRENT_TIMESTAMP
WHERE Reservation_ID = ?
```

- **Tables involved:** `Reservations`
- **Used by:** `POST /api/reservations/:id/check-out` (within transaction)

---

## 4. Housekeeping Queries

### 4.1 Get All Housekeeping Tasks (View-Like Query)

**Purpose:** Retrieves all housekeeping tasks with enriched room, branch, and assigned staff information. Functions as a **virtual view** over four tables.

```sql
SELECT ht.Task_ID, ht.Room_ID, ht.Assigned_Staff_ID, ht.Task_Type, ht.Status, ht.Reported_Date,
       r.Room_Number, b.Location_Name,
       CONCAT(s.First_Name, ' ', s.Last_Name) AS Assigned_Staff_Name
FROM HousekeepingTask ht
JOIN Rooms r ON ht.Room_ID = r.Room_ID
JOIN Branch b ON r.Branch_ID = b.Branch_ID
LEFT JOIN Staff s ON ht.Assigned_Staff_ID = s.Staff_ID
ORDER BY ht.Reported_Date DESC
```

- **Tables involved:** `HousekeepingTask`, `Rooms`, `Branch`, `Staff`
- **Join types:** INNER JOIN for room/branch; LEFT JOIN for optional staff assignment
- **Used by:** `GET /api/housekeeping`

### 4.2 Get Task by ID (for status update validation)

```sql
SELECT Room_ID FROM HousekeepingTask WHERE Task_ID = ?
```

- **Used by:** `PATCH /api/housekeeping/:id/status` (within transaction)

### 4.3 Update Housekeeping Task Status

```sql
UPDATE HousekeepingTask SET Status = ? WHERE Task_ID = ?
```

- **Used by:** `PATCH /api/housekeeping/:id/status` (within transaction)

### 4.4 Create Housekeeping Task

```sql
INSERT INTO HousekeepingTask (Task_ID, Room_ID, Assigned_Staff_ID, Task_Type, Status, Reported_Date)
VALUES (?, ?, ?, ?, 'Pending', CURRENT_DATE)
```

- **Tables involved:** `HousekeepingTask`
- **Used by:** `POST /api/housekeeping`

---

## 5. Spa & Wellness Service Queries

### 5.1 Get All Spa Services

```sql
SELECT * FROM SpaService ORDER BY Price ASC
```

- **Used by:** `GET /api/spa/services`

### 5.2 Get All Therapists with Staff Details

**Purpose:** Retrieves therapist records joined with their staff profile.

```sql
SELECT t.Therapist_ID, t.Staff_ID, t.Specialty,
       s.First_Name, s.Last_Name, s.Email
FROM Therapist t
JOIN Staff s ON t.Staff_ID = s.Staff_ID
```

- **Tables involved:** `Therapist`, `Staff`
- **Used by:** `GET /api/spa/therapists`

### 5.3 Get All Spa Appointments (View-Like Query)

**Purpose:** Comprehensive query joining seven tables to produce a full appointment view with service details, therapist name, room number, and guest information.

```sql
SELECT sa.Appointment_ID, sa.Reservation_ID, sa.Service_ID, sa.Therapist_ID,
       sa.Start_Time, sa.End_Time, sa.Status,
       ss.Service_Name, ss.Duration_Minutes, ss.Price,
       CONCAT(s.First_Name, ' ', s.Last_Name) AS Therapist_Name,
       r.Room_ID, rm.Room_Number,
       CONCAT(g.First_Name, ' ', g.Last_Name) AS Guest_Name,
       g.Email AS Guest_Email
FROM SpaAppointment sa
JOIN SpaService ss ON sa.Service_ID = ss.Service_ID
JOIN Therapist t ON sa.Therapist_ID = t.Therapist_ID
JOIN Staff s ON t.Staff_ID = s.Staff_ID
JOIN Reservations r ON sa.Reservation_ID = r.Reservation_ID
JOIN Rooms rm ON r.Room_ID = rm.Room_ID
JOIN Guest g ON r.Guest_ID = g.Guest_ID
ORDER BY sa.Start_Time DESC
```

- **Tables involved:** `SpaAppointment`, `SpaService`, `Therapist`, `Staff`, `Reservations`, `Rooms`, `Guest`
- **This is the most complex JOIN query in the system (7 tables)**
- **Used by:** `GET /api/spa/appointments`

### 5.4 Verify Reservation for Spa Booking

```sql
SELECT Reservation_ID, Guest_ID FROM Reservations WHERE Reservation_ID = ?
```

### 5.5 Fallback — Find Most Recent Reservation

```sql
SELECT Reservation_ID FROM Reservations ORDER BY Created_At DESC LIMIT 1
```

### 5.6 Select Default Therapist

```sql
SELECT Therapist_ID FROM Therapist LIMIT 1
```

### 5.7 Get Spa Service Details

```sql
SELECT Service_ID, Service_Name, Duration_Minutes, Price FROM SpaService WHERE Service_ID = ?
```

### 5.8 Insert Spa Appointment

```sql
INSERT INTO SpaAppointment (Appointment_ID, Reservation_ID, Service_ID, Therapist_ID,
                            Start_Time, End_Time, Status)
VALUES (?, ?, ?, ?, ?, ?, 'Scheduled')
```

### 5.9 Add Spa Charge to Guest Invoice

```sql
INSERT INTO InvoiceItem (InvoiceItem_ID, Invoice_ID, Description, Charge_Category, Amount)
VALUES (?, ?, ?, 'Spa & Wellness', ?)
```

### 5.10 Update Invoice Totals After Spa Charge

```sql
UPDATE Invoice
SET Total_Charges = Total_Charges + ?,
    Net_Payable = Net_Payable + ?
WHERE Invoice_ID = ?
```

### 5.11 Update Spa Appointment Status

```sql
UPDATE SpaAppointment SET Status = ? WHERE Appointment_ID = ?
```

- **Used by:** `PATCH /api/spa/appointments/:id/status`

---

## 6. Staff, Guest & Invoice Queries (View-Like)

### 6.1 Get All Staff with Role Specializations (View-Like Query)

**Purpose:** Acts as a **virtual staff directory view** that merges the base Staff table with all three specialization sub-tables and the branch name.

```sql
SELECT s.Staff_ID, s.First_Name, s.Last_Name, s.Email, s.Role, s.Branch_ID, s.Created_At,
       b.Location_Name,
       r.Shift_Timing, r.Desk_Extension,
       m.Department_Managed, m.Office_Number,
       t.Therapist_ID, t.Specialty
FROM Staff s
JOIN Branch b ON s.Branch_ID = b.Branch_ID
LEFT JOIN Receptionist r ON s.Staff_ID = r.Staff_ID
LEFT JOIN Manager m ON s.Staff_ID = m.Staff_ID
LEFT JOIN Therapist t ON s.Staff_ID = t.Staff_ID
WHERE 1=1
  [AND s.Branch_ID = ?]      -- Optional branch filter
  [AND s.Role = ?]            -- Optional role filter
ORDER BY s.Role ASC, s.First_Name ASC
```

- **Tables involved:** `Staff`, `Branch`, `Receptionist`, `Manager`, `Therapist`
- **Used by:** `GET /api/operations/staff`

### 6.2 Get All Guests with Booking Count (View-Like Query)

**Purpose:** Retrieves the guest directory with an aggregated count of total bookings per guest. Functions as a **virtual guest CRM view**.

```sql
SELECT g.Guest_ID, g.First_Name, g.Last_Name, g.Email, g.Phone,
       g.Loyalty_Points, g.Loyalty_Tier, g.Account_Status, g.Special_Requests, g.Created_At,
       COUNT(res.Reservation_ID) AS Total_Bookings
FROM Guest g
LEFT JOIN Reservations res ON g.Guest_ID = res.Guest_ID
GROUP BY g.Guest_ID
ORDER BY g.Loyalty_Points DESC
```

- **Tables involved:** `Guest`, `Reservations`
- **Aggregation:** `COUNT()` with `GROUP BY` to calculate total bookings per guest
- **Ordering:** Guests sorted by loyalty points (highest first) for CRM prioritization
- **Used by:** `GET /api/operations/guests`

### 6.3 Get All Invoices with Payment Details (View-Like Query)

**Purpose:** Acts as a **virtual billing view** joining invoices, reservations, guests, and payments into a consolidated billing report.

```sql
SELECT inv.Invoice_ID, inv.Reservation_ID, inv.Issue_Date,
       inv.Total_Charges, inv.Tax_Applied AS Tax_Amount, inv.Discount_Applied AS Discount,
       inv.Net_Payable,
       res.Check_In_Date, res.Check_Out_Date, res.Booking_Status,
       CONCAT(g.First_Name, ' ', g.Last_Name) AS Guest_Name,
       g.Email AS Guest_Email,
       p.Payment_ID, p.Method AS Payment_Method, p.Payment_Status, p.Payment_Date
FROM Invoice inv
JOIN Reservations res ON inv.Reservation_ID = res.Reservation_ID
JOIN Guest g ON res.Guest_ID = g.Guest_ID
LEFT JOIN Payments p ON inv.Invoice_ID = p.Invoice_ID
ORDER BY inv.Issue_Date DESC, inv.Invoice_ID DESC
```

- **Tables involved:** `Invoice`, `Reservations`, `Guest`, `Payments`
- **Used by:** `GET /api/operations/invoices`

---

## 7. Analytics & Dashboard Queries (View-Like)

These queries collectively serve as the **analytics dashboard view**, aggregating key metrics across the entire database.

### 7.1 Total Room Count

```sql
SELECT COUNT(*) AS totalRooms FROM Rooms
```

### 7.2 Currently Occupied Rooms

```sql
SELECT COUNT(DISTINCT Room_ID) AS occupiedRooms
FROM Reservations
WHERE Booking_Status = 'Checked-In'
```

### 7.3 Rooms Pending Cleaning

```sql
SELECT COUNT(*) AS pendingCleaning
FROM Rooms
WHERE Housekeeping_Status IN ('Dirty', 'Cleaning In Progress')
```

### 7.4 Total Revenue

```sql
SELECT COALESCE(SUM(Net_Payable), 0) AS totalRevenue
FROM Invoice
```

- **Note:** Uses `COALESCE` to handle the case of zero invoices (returns 0 instead of NULL)

### 7.5 Revenue by Branch (Aggregated View-Like Query)

**Purpose:** Provides a branch-level performance summary with room counts and revenue totals. This is the most significant **analytical view** in the system.

```sql
SELECT b.Branch_ID, b.Location_Name,
       COUNT(DISTINCT r.Room_ID) AS roomCount,
       COALESCE(SUM(inv.Net_Payable), 0) AS branchRevenue
FROM Branch b
LEFT JOIN Rooms r ON b.Branch_ID = r.Branch_ID
LEFT JOIN Reservations res ON r.Room_ID = res.Room_ID
LEFT JOIN Invoice inv ON res.Reservation_ID = inv.Reservation_ID
GROUP BY b.Branch_ID, b.Location_Name
```

- **Tables involved:** `Branch`, `Rooms`, `Reservations`, `Invoice`
- **Aggregation:** `COUNT(DISTINCT)` for room count; `SUM()` for revenue; `GROUP BY` branch
- **Post-processing:** The application calculates `occupancyRate` as `(occupiedRooms / totalRooms) * 100`
- **Used by:** `GET /api/operations/analytics`

---

## 8. Transactional Logic (Trigger-Like Behavior)

The system implements trigger-like cascading behavior using **explicit database transactions** (`BEGIN` / `COMMIT` / `ROLLBACK`) managed via the `mysql2` connection pool. These simulate what would traditionally be handled by SQL triggers.

### 8.1 Reservation Creation Transaction

**Endpoint:** `POST /api/reservations`

This is the most complex transaction in the system. It atomically performs **five linked operations** within a single transaction:

| Step | Operation | Query |
|------|-----------|-------|
| 1 | **Find available room** | Sub-query checking date-range overlap against active reservations |
| 2 | **Insert Reservation** | `INSERT INTO Reservations` with status 'Confirmed' |
| 3 | **Create Invoice** | `INSERT INTO Invoice` with computed charges, taxes, and net payable |
| 4 | **Create Invoice Line Item** | `INSERT INTO InvoiceItem` with accommodation charge description |
| 5 | **Record Payment** | `INSERT INTO Payments` with 'Completed' status |
| 6 | **Update Loyalty Points** | `UPDATE Guest SET Loyalty_Points = Loyalty_Points + 120` |

**Trigger-like behavior:** When a reservation is created, the system automatically:
- Generates an invoice for the stay
- Creates an itemized accommodation charge
- Records the payment
- Awards 120 loyalty points to the guest

**Rollback:** If any step fails, the entire transaction is rolled back to maintain data consistency.

### 8.2 Check-Out Transaction

**Endpoint:** `POST /api/reservations/:id/check-out`

Atomically performs three cascading operations when a guest checks out:

| Step | Operation | Query |
|------|-----------|-------|
| 1 | **Mark reservation Checked-Out** | `UPDATE Reservations SET Booking_Status = 'Checked-Out', Actual_Check_Out = CURRENT_TIMESTAMP` |
| 2 | **Mark room as Dirty** | `UPDATE Rooms SET Housekeeping_Status = 'Dirty'` |
| 3 | **Create housekeeping task** | `INSERT INTO HousekeepingTask` with type 'Check-Out Turnover & Sanitation' |

**Trigger-like behavior:** Checking out a guest automatically:
- Marks the room as dirty (simulates an `AFTER UPDATE` trigger on Reservations)
- Creates a pending housekeeping task for room turnover

### 8.3 Housekeeping Task Status Update Transaction

**Endpoint:** `PATCH /api/housekeeping/:id/status`

Atomically updates a housekeeping task and its associated room status:

| Step | Operation | Effect |
|------|-----------|--------|
| 1 | **Update task status** | `UPDATE HousekeepingTask SET Status = ?` |
| 2a | If status = 'Completed' | `UPDATE Rooms SET Housekeeping_Status = 'Clean'` |
| 2b | If status = 'In Progress' | `UPDATE Rooms SET Housekeeping_Status = 'Cleaning In Progress'` |

**Trigger-like behavior:** Completing a housekeeping task automatically updates the room's status to 'Clean' (simulates an `AFTER UPDATE` trigger on HousekeepingTask).

### 8.4 Spa Booking Transaction

**Endpoint:** `POST /api/spa/appointments`

Atomically books a spa appointment and updates the guest's invoice:

| Step | Operation | Query |
|------|-----------|-------|
| 1 | **Verify/resolve reservation** | SELECT from Reservations |
| 2 | **Resolve therapist** | SELECT from Therapist (if not provided) |
| 3 | **Fetch service details** | SELECT from SpaService |
| 4 | **Insert appointment** | `INSERT INTO SpaAppointment` |
| 5 | **Add invoice line item** | `INSERT INTO InvoiceItem` with category 'Spa & Wellness' |
| 6 | **Update invoice totals** | `UPDATE Invoice SET Total_Charges = Total_Charges + ?, Net_Payable = Net_Payable + ?` |

**Trigger-like behavior:** Booking a spa service automatically:
- Adds a line item to the guest's existing invoice
- Updates the invoice total charges and net payable amount

---

## 9. Seed & Data Population Queries

The seed script (`backend/src/scripts/seed.js`) populates all tables with sample luxury hotel data using a transaction:

| Table | Records | Description |
|-------|---------|-------------|
| `Branch` | 3 | Coastal Estate, Lake Pavilion, Highland Sanctuary |
| `Staff` | 3 | Manager, Receptionist, Therapist (with bcrypt-hashed passwords) |
| `Manager` | 1 | Executive Operations department |
| `Receptionist` | 1 | Morning shift |
| `Therapist` | 1 | Aromatherapy & Deep Tissue specialty |
| `RoomType` | 5 | Signature, Deluxe, Terrace Suite, Palace Suite, Royal Residence |
| `Rooms` | 6 | Rooms across the Coastal Estate branch |
| `Room_Amenities` | 7 | Ocean View, King Bed, Jacuzzi, Private Pool, Butler Service, etc. |
| `Guest` | 3 | Platinum, Gold, and Silver loyalty tier guests |
| `Reservations` | 3 | Two Checked-In, one Confirmed |
| `HousekeepingTask` | 2 | Deep Turnover Cleaning, Linen Refresh |
| `SpaService` | 3 | Salt Stone Therapy, Caviar Facial, Aromatherapy Massage |
| `SpaAppointment` | 1 | Scheduled appointment |
| `MealPlan` | 3 | B&B, Half Board, All-Inclusive |
| `MenuItem` | 4 | Smoked Salmon, Ribeye Steak, Truffle Risotto, Dom Pérignon |
| `Invoice` | 1 | Sample completed invoice |
| `Payments` | 1 | Credit card payment |

The seed script uses `SET FOREIGN_KEY_CHECKS = 0` before truncating and `SET FOREIGN_KEY_CHECKS = 1` after insertion to handle the circular foreign key dependencies during re-seeding.

---

## 10. Indexes for Query Optimization

The schema defines the following indexes to improve the performance of the most frequent query patterns:

| Index Name | Table | Column(s) | Purpose |
|------------|-------|-----------|---------|
| `idx_staff_branch` | Staff | Branch_ID | Speeds up staff-by-branch lookups |
| `idx_rooms_branch` | Rooms | Branch_ID | Speeds up room-by-branch filtering |
| `idx_rooms_roomtype` | Rooms | RoomType_ID | Speeds up room-by-type filtering |
| `idx_reservations_dates` | Reservations | Check_In_Date, Check_Out_Date | Composite index for date-range overlap queries (availability checks) |
| `idx_reservations_guest` | Reservations | Guest_ID | Speeds up guest booking history lookups |
| `idx_reservations_room` | Reservations | Room_ID | Speeds up room occupancy lookups |
| `idx_foodorder_reservation` | FoodOrder | Reservation_ID | Speeds up food order retrieval by reservation |
| `idx_spa_appointment_reservation` | SpaAppointment | Reservation_ID | Speeds up spa appointment retrieval by reservation |
| `idx_spa_appointment_therapist` | SpaAppointment | Therapist_ID | Speeds up therapist schedule lookups |
| `idx_invoiceitem_invoice` | InvoiceItem | Invoice_ID | Speeds up invoice line item retrieval |
| `idx_payments_reservation` | Payments | Reservation_ID | Speeds up payment lookup by reservation |
| `idx_payments_invoice` | Payments | Invoice_ID | Speeds up payment lookup by invoice |

---

## Summary

| Category | Count | Description |
|----------|-------|-------------|
| **SELECT Queries** | 22 | Data retrieval queries across all modules |
| **INSERT Queries** | 10 | Record creation across reservations, invoices, tasks, appointments |
| **UPDATE Queries** | 8 | Status updates for reservations, rooms, tasks, invoices, loyalty |
| **View-Like Queries** | 7 | Complex multi-table JOINs that function as virtual database views |
| **Trigger-Like Transactions** | 4 | Multi-step transactional blocks simulating database trigger cascades |
| **Optimization Indexes** | 12 | B-tree indexes on frequently queried columns |
