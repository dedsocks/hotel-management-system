-- =============================================================================
-- Hotel Management System Database Schema (DDL)
-- Compatible with PostgreSQL / MySQL / SQLite (Standard SQL with engine adaptations)
-- =============================================================================

-- Disable foreign key checks during setup if running on MySQL
-- SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS Payments;
DROP TABLE IF EXISTS InvoiceItem;
DROP TABLE IF EXISTS Invoice;
DROP TABLE IF EXISTS Coupon;
DROP TABLE IF EXISTS Tax;
DROP TABLE IF EXISTS SpaAppointment;
DROP TABLE IF EXISTS SpaService;
DROP TABLE IF EXISTS Therapist;
DROP TABLE IF EXISTS FoodOrderItem;
DROP TABLE IF EXISTS FoodOrder;
DROP TABLE IF EXISTS MenuItem;
DROP TABLE IF EXISTS MealPlan;
DROP TABLE IF EXISTS HousekeepingTask;
DROP TABLE IF EXISTS Reservations;
DROP TABLE IF EXISTS Guest;
DROP TABLE IF EXISTS PriceRule;
DROP TABLE IF EXISTS Room_Amenities;
DROP TABLE IF EXISTS Rooms;
DROP TABLE IF EXISTS RoomType;
DROP TABLE IF EXISTS Manager;
DROP TABLE IF EXISTS Receptionist;
DROP TABLE IF EXISTS Staff;
DROP TABLE IF EXISTS Branch;

-- =============================================================================
-- 1. AUTHENTICATION & STAFF MANAGEMENT
-- =============================================================================

CREATE TABLE Branch (
    Branch_ID VARCHAR(36) PRIMARY KEY,
    Location_Name VARCHAR(100) NOT NULL,
    Address TEXT NOT NULL,
    Contact_Info VARCHAR(100) NOT NULL,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Staff (
    Staff_ID VARCHAR(36) PRIMARY KEY,
    First_Name VARCHAR(50) NOT NULL,
    Last_Name VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password_Hash VARCHAR(255) NOT NULL,
    Role VARCHAR(50) NOT NULL,
    Branch_ID VARCHAR(36) NOT NULL,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_staff_branch FOREIGN KEY (Branch_ID)
        REFERENCES Branch (Branch_ID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Specialization: Receptionist (1:1 with Staff)
CREATE TABLE Receptionist (
    Staff_ID VARCHAR(36) PRIMARY KEY,
    Shift_Timing VARCHAR(50) NOT NULL,
    Desk_Extension VARCHAR(20),
    CONSTRAINT fk_receptionist_staff FOREIGN KEY (Staff_ID)
        REFERENCES Staff (Staff_ID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Specialization: Manager (1:1 with Staff)
CREATE TABLE Manager (
    Staff_ID VARCHAR(36) PRIMARY KEY,
    Department_Managed VARCHAR(100) NOT NULL,
    Office_Number VARCHAR(20),
    CONSTRAINT fk_manager_staff FOREIGN KEY (Staff_ID)
        REFERENCES Staff (Staff_ID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Specialization / Role Extension: Therapist (1:1 with Staff)
CREATE TABLE Therapist (
    Therapist_ID VARCHAR(36) PRIMARY KEY,
    Staff_ID VARCHAR(36) NOT NULL UNIQUE,
    Specialty VARCHAR(100) NOT NULL,
    CONSTRAINT fk_therapist_staff FOREIGN KEY (Staff_ID)
        REFERENCES Staff (Staff_ID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================================================
-- 2. PROPERTY & ROOM INFRASTRUCTURE
-- =============================================================================

CREATE TABLE RoomType (
    RoomType_ID VARCHAR(36) PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Base_Capacity INT NOT NULL CHECK (Base_Capacity > 0),
    Base_Price DECIMAL(10, 2) NOT NULL CHECK (Base_Price >= 0),
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Rooms (
    Room_ID VARCHAR(36) PRIMARY KEY,
    Room_Number VARCHAR(20) NOT NULL,
    Branch_ID VARCHAR(36) NOT NULL,
    RoomType_ID VARCHAR(36) NOT NULL,
    Housekeeping_Status VARCHAR(50) NOT NULL DEFAULT 'Clean',
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_branch_room_number UNIQUE (Branch_ID, Room_Number),
    CONSTRAINT fk_rooms_branch FOREIGN KEY (Branch_ID)
        REFERENCES Branch (Branch_ID) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_rooms_roomtype FOREIGN KEY (RoomType_ID)
        REFERENCES RoomType (RoomType_ID) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Multivalued Room Amenities
CREATE TABLE Room_Amenities (
    Room_ID VARCHAR(36) NOT NULL,
    Amenity_Name VARCHAR(100) NOT NULL,
    PRIMARY KEY (Room_ID, Amenity_Name),
    CONSTRAINT fk_amenities_room FOREIGN KEY (Room_ID)
        REFERENCES Rooms (Room_ID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE PriceRule (
    Rule_ID VARCHAR(36) PRIMARY KEY,
    RoomType_ID VARCHAR(36) NOT NULL,
    Start_Date DATE NOT NULL,
    End_Date DATE NOT NULL,
    Price_Multiplier DECIMAL(5, 2) NOT NULL DEFAULT 1.00 CHECK (Price_Multiplier >= 0),
    Rule_Name VARCHAR(100) NOT NULL,
    CONSTRAINT chk_price_dates CHECK (End_Date >= Start_Date),
    CONSTRAINT fk_pricerule_roomtype FOREIGN KEY (RoomType_ID)
        REFERENCES RoomType (RoomType_ID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================================================
-- 3. CRM, RESERVATIONS & OPERATIONS
-- =============================================================================

CREATE TABLE Guest (
    Guest_ID VARCHAR(36) PRIMARY KEY,
    First_Name VARCHAR(50) NOT NULL,
    Last_Name VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Phone VARCHAR(20) NOT NULL,
    Loyalty_Points INT NOT NULL DEFAULT 0 CHECK (Loyalty_Points >= 0),
    Loyalty_Tier VARCHAR(50) NOT NULL DEFAULT 'Bronze',
    Special_Requests TEXT,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Reservations (
    Reservation_ID VARCHAR(36) PRIMARY KEY,
    Guest_ID VARCHAR(36) NOT NULL,
    Room_ID VARCHAR(36) NOT NULL,
    Check_In_Date DATE NOT NULL,
    Check_Out_Date DATE NOT NULL,
    Actual_Check_In TIMESTAMP NULL,
    Actual_Check_Out TIMESTAMP NULL,
    Booking_Status VARCHAR(50) NOT NULL DEFAULT 'Confirmed',
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_reservation_dates CHECK (Check_Out_Date > Check_In_Date),
    CONSTRAINT fk_reservation_guest FOREIGN KEY (Guest_ID)
        REFERENCES Guest (Guest_ID) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_reservation_room FOREIGN KEY (Room_ID)
        REFERENCES Rooms (Room_ID) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE HousekeepingTask (
    Task_ID VARCHAR(36) PRIMARY KEY,
    Room_ID VARCHAR(36) NOT NULL,
    Assigned_Staff_ID VARCHAR(36),
    Task_Type VARCHAR(50) NOT NULL,
    Status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    Reported_Date DATE NOT NULL,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_task_room FOREIGN KEY (Room_ID)
        REFERENCES Rooms (Room_ID) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_task_staff FOREIGN KEY (Assigned_Staff_ID)
        REFERENCES Staff (Staff_ID) ON DELETE SET NULL ON UPDATE CASCADE
);

-- =============================================================================
-- 4. ON-SITE SERVICES & POS INTEGRATION
-- =============================================================================

CREATE TABLE MealPlan (
    Plan_ID VARCHAR(36) PRIMARY KEY,
    Plan_Name VARCHAR(100) NOT NULL,
    Price_Per_Day DECIMAL(10, 2) NOT NULL CHECK (Price_Per_Day >= 0)
);

CREATE TABLE MenuItem (
    Item_ID VARCHAR(36) PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    Category VARCHAR(50) NOT NULL,
    Price DECIMAL(10, 2) NOT NULL CHECK (Price >= 0)
);

CREATE TABLE FoodOrder (
    Order_ID VARCHAR(36) PRIMARY KEY,
    Reservation_ID VARCHAR(36) NOT NULL,
    Order_Time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Total_Amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (Total_Amount >= 0),
    Order_Status VARCHAR(50) NOT NULL DEFAULT 'Placed',
    CONSTRAINT fk_foodorder_reservation FOREIGN KEY (Reservation_ID)
        REFERENCES Reservations (Reservation_ID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE FoodOrderItem (
    Order_ID VARCHAR(36) NOT NULL,
    Item_ID VARCHAR(36) NOT NULL,
    Quantity INT NOT NULL CHECK (Quantity > 0),
    Subtotal_Price DECIMAL(10, 2) NOT NULL CHECK (Subtotal_Price >= 0),
    PRIMARY KEY (Order_ID, Item_ID),
    CONSTRAINT fk_orderitem_order FOREIGN KEY (Order_ID)
        REFERENCES FoodOrder (Order_ID) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_orderitem_item FOREIGN KEY (Item_ID)
        REFERENCES MenuItem (Item_ID) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE SpaService (
    Service_ID VARCHAR(36) PRIMARY KEY,
    Service_Name VARCHAR(100) NOT NULL,
    Duration_Minutes INT NOT NULL CHECK (Duration_Minutes > 0),
    Price DECIMAL(10, 2) NOT NULL CHECK (Price >= 0)
);

CREATE TABLE SpaAppointment (
    Appointment_ID VARCHAR(36) PRIMARY KEY,
    Reservation_ID VARCHAR(36) NOT NULL,
    Service_ID VARCHAR(36) NOT NULL,
    Therapist_ID VARCHAR(36) NOT NULL,
    Start_Time TIMESTAMP NOT NULL,
    End_Time TIMESTAMP NOT NULL,
    Status VARCHAR(50) NOT NULL DEFAULT 'Scheduled',
    CONSTRAINT chk_spa_times CHECK (End_Time > Start_Time),
    CONSTRAINT fk_spa_reservation FOREIGN KEY (Reservation_ID)
        REFERENCES Reservations (Reservation_ID) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_spa_service FOREIGN KEY (Service_ID)
        REFERENCES SpaService (Service_ID) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_spa_therapist FOREIGN KEY (Therapist_ID)
        REFERENCES Therapist (Therapist_ID) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- =============================================================================
-- 5. BILLING, PAYMENTS & INVOICING
-- =============================================================================

CREATE TABLE Tax (
    Tax_ID VARCHAR(36) PRIMARY KEY,
    Tax_Name VARCHAR(100) NOT NULL,
    Percentage_Rate DECIMAL(5, 2) NOT NULL CHECK (Percentage_Rate >= 0)
);

CREATE TABLE Coupon (
    Coupon_Code VARCHAR(50) PRIMARY KEY,
    Discount_Percentage DECIMAL(5, 2) NOT NULL CHECK (Discount_Percentage >= 0 AND Discount_Percentage <= 100),
    Max_Discount_Amount DECIMAL(10, 2) NOT NULL CHECK (Max_Discount_Amount >= 0),
    Expiry_Date DATE NOT NULL
);

CREATE TABLE Invoice (
    Invoice_ID VARCHAR(36) PRIMARY KEY,
    Reservation_ID VARCHAR(36) NOT NULL UNIQUE,
    Issue_Date DATE NOT NULL,
    Total_Charges DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (Total_Charges >= 0),
    Discount_Applied DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (Discount_Applied >= 0),
    Tax_Applied DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (Tax_Applied >= 0),
    Net_Payable DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (Net_Payable >= 0),
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoice_reservation FOREIGN KEY (Reservation_ID)
        REFERENCES Reservations (Reservation_ID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE InvoiceItem (
    InvoiceItem_ID VARCHAR(36) PRIMARY KEY,
    Invoice_ID VARCHAR(36) NOT NULL,
    Description TEXT NOT NULL,
    Charge_Category VARCHAR(50) NOT NULL,
    Amount DECIMAL(10, 2) NOT NULL CHECK (Amount >= 0),
    CONSTRAINT fk_invoiceitem_invoice FOREIGN KEY (Invoice_ID)
        REFERENCES Invoice (Invoice_ID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Payments (
    Payment_ID VARCHAR(36) PRIMARY KEY,
    Reservation_ID VARCHAR(36) NOT NULL,
    Invoice_ID VARCHAR(36) NOT NULL,
    Amount DECIMAL(10, 2) NOT NULL CHECK (Amount > 0),
    Payment_Date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Method VARCHAR(50) NOT NULL,
    Payment_Status VARCHAR(50) NOT NULL DEFAULT 'Completed',
    CONSTRAINT fk_payments_reservation FOREIGN KEY (Reservation_ID)
        REFERENCES Reservations (Reservation_ID) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_payments_invoice FOREIGN KEY (Invoice_ID)
        REFERENCES Invoice (Invoice_ID) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- =============================================================================
-- 6. INDEXES FOR QUERY OPTIMIZATION
-- =============================================================================

CREATE INDEX idx_staff_branch ON Staff (Branch_ID);
CREATE INDEX idx_rooms_branch ON Rooms (Branch_ID);
CREATE INDEX idx_rooms_roomtype ON Rooms (RoomType_ID);
CREATE INDEX idx_reservations_dates ON Reservations (Check_In_Date, Check_Out_Date);
CREATE INDEX idx_reservations_guest ON Reservations (Guest_ID);
CREATE INDEX idx_reservations_room ON Reservations (Room_ID);
CREATE INDEX idx_foodorder_reservation ON FoodOrder (Reservation_ID);
CREATE INDEX idx_spa_appointment_reservation ON SpaAppointment (Reservation_ID);
CREATE INDEX idx_spa_appointment_therapist ON SpaAppointment (Therapist_ID);
CREATE INDEX idx_invoiceitem_invoice ON InvoiceItem (Invoice_ID);
CREATE INDEX idx_payments_reservation ON Payments (Reservation_ID);
CREATE INDEX idx_payments_invoice ON Payments (Invoice_ID);
