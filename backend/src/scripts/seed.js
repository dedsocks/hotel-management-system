const pool = require('../config/db');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  const connection = await pool.getConnection();
  try {
    console.log('Seeding database with initial data...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');

    // Truncate tables for fresh seed
    const tables = [
      'Payments', 'InvoiceItem', 'Invoice', 'Coupon', 'Tax', 'SpaAppointment', 'SpaService',
      'Therapist', 'FoodOrderItem', 'FoodOrder', 'MenuItem', 'MealPlan', 'HousekeepingTask',
      'Reservations', 'Guest', 'PriceRule', 'Room_Amenities', 'Rooms', 'RoomType',
      'Manager', 'Receptionist', 'Staff', 'Branch'
    ];
    for (const table of tables) {
      await connection.query(`TRUNCATE TABLE ${table};`);
    }

    // 1. Branches
    await connection.query(`
      INSERT INTO Branch (Branch_ID, Location_Name, Address, Contact_Info) VALUES
      ('b-01', 'The Grand Girvan Palace • Coastal Estate', '1 Girvan Palace Way, Ayrshire Coast, Scotland', '+44 1465 710000'),
      ('b-02', 'The Grand Girvan Palace • Lake Pavilion', 'Via Regina 42, Lake Como, Italy', '+39 031 950 000'),
      ('b-03', 'The Grand Girvan Palace • Highland Sanctuary', 'Loch Fyne Highlands, Scotland', '+44 1499 300000');
    `);

    // 2. Staff and sub-roles
    const defaultPassword = await bcrypt.hash('password123', 10);
    await connection.query(`
      INSERT INTO Staff (Staff_ID, First_Name, Last_Name, Email, Password_Hash, Role, Branch_ID) VALUES
      ('st-01', 'Elena', 'Rostova', 'manager@grandgirvanpalace.com', ?, 'Manager', 'b-01'),
      ('st-02', 'Julian', 'Mercier', 'reception@grandgirvanpalace.com', ?, 'Receptionist', 'b-01'),
      ('st-03', 'Chloe', 'Dubois', 'therapist@grandgirvanpalace.com', ?, 'Therapist', 'b-01');
    `, [defaultPassword, defaultPassword, defaultPassword]);

    await connection.query(`
      INSERT INTO Manager (Staff_ID, Department_Managed, Office_Number) VALUES
      ('st-01', 'Executive Operations', 'Suite 401');
    `);

    await connection.query(`
      INSERT INTO Receptionist (Staff_ID, Shift_Timing, Desk_Extension) VALUES
      ('st-02', 'Morning (07:00 - 15:30)', '101');
    `);

    await connection.query(`
      INSERT INTO Therapist (Therapist_ID, Staff_ID, Specialty) VALUES
      ('th-01', 'st-03', 'Aromatherapy & Deep Tissue');
    `);

    // 3. Room Types
    await connection.query(`
      INSERT INTO RoomType (RoomType_ID, Name, Base_Capacity, Base_Price) VALUES
      ('rt-sig', 'Signature Room', 2, 18500.00),
      ('rt-dlx', 'Deluxe Room', 2, 24500.00),
      ('rt-ter', 'Terrace Suite', 3, 36000.00),
      ('rt-mai', 'Palace Suite', 4, 52000.00),
      ('rt-res', 'Royal Residence Suite', 6, 85000.00);
    `);

    // 4. Rooms
    await connection.query(`
      INSERT INTO Rooms (Room_ID, Room_Number, Branch_ID, RoomType_ID, Housekeeping_Status) VALUES
      ('rm-101', '101', 'b-01', 'rt-sig', 'Clean'),
      ('rm-102', '102', 'b-01', 'rt-dlx', 'Cleaning In Progress'),
      ('rm-201', '201', 'b-01', 'rt-ter', 'Inspected'),
      ('rm-301', '301', 'b-01', 'rt-mai', 'Dirty'),
      ('rm-401', '401', 'b-01', 'rt-res', 'Clean'),
      ('rm-402', '402', 'b-01', 'rt-res', 'Clean');
    `);

    // 5. Room Amenities
    await connection.query(`
      INSERT INTO Room_Amenities (Room_ID, Amenity_Name) VALUES
      ('rm-101', 'Ocean View Balcony'),
      ('rm-101', 'King Size Bed'),
      ('rm-101', 'Nespresso Coffee Machine'),
      ('rm-102', 'Marble Jacuzzi'),
      ('rm-201', 'Private Sun Deck'),
      ('rm-401', 'Private Plunge Pool'),
      ('rm-401', '24/7 Butler Service');
    `);

    // 6. Guests
    await connection.query(`
      INSERT INTO Guest (Guest_ID, First_Name, Last_Name, Email, Password_Hash, Phone, Loyalty_Points, Loyalty_Tier, Account_Status, Special_Requests) VALUES
      ('g-01', 'Alexander', 'Wright', 'alex.wright@luxurytravel.com', ?, '+1 (555) 234-5678', 1420, 'Platinum', 'Active', 'High floor, feather-free pillows'),
      ('g-02', 'Camilla', 'Laurent', 'camilla@laurent-design.fr', ?, '+33 6 12 34 56 78', 850, 'Gold', 'Active', 'Champagne on arrival'),
      ('g-03', 'Marcus', 'Vance', 'mvance@investcorp.com', ?, '+44 20 7946 0912', 320, 'Silver', 'Active', 'Early check-in preferred');
    `, [defaultPassword, defaultPassword, defaultPassword]);

    // 7. Reservations
    await connection.query(`
      INSERT INTO Reservations (Reservation_ID, Guest_ID, Room_ID, Check_In_Date, Check_Out_Date, Actual_Check_In, Actual_Check_Out, Booking_Status) VALUES
      ('res-8841', 'g-01', 'rm-101', '2026-10-28', '2026-10-31', '2026-10-28 14:15:00', NULL, 'Checked-In'),
      ('res-8842', 'g-02', 'rm-201', '2026-10-29', '2026-11-03', '2026-10-29 11:30:00', NULL, 'Checked-In'),
      ('res-8843', 'g-03', 'rm-401', '2026-11-01', '2026-11-05', NULL, NULL, 'Confirmed');
    `);

    // 8. Housekeeping Tasks
    await connection.query(`
      INSERT INTO HousekeepingTask (Task_ID, Room_ID, Assigned_Staff_ID, Task_Type, Status, Reported_Date) VALUES
      ('tsk-01', 'rm-301', 'st-02', 'Deep Turnover Cleaning', 'In Progress', '2026-10-29'),
      ('tsk-02', 'rm-102', 'st-02', 'Linen Refresh & Restock', 'Pending', '2026-10-29');
    `);

    // 9. Spa Services & Appointments
    await connection.query(`
      INSERT INTO SpaService (Service_ID, Service_Name, Duration_Minutes, Price) VALUES
      ('spa-01', 'Himalayan Salt Stone Therapy', 90, 12500.00),
      ('spa-02', 'Royal Caviar Age-Defying Facial', 60, 16000.00),
      ('spa-03', 'Aromatherapy Deep Muscle Massage', 75, 9500.00);
    `);

    await connection.query(`
      INSERT INTO SpaAppointment (Appointment_ID, Reservation_ID, Service_ID, Therapist_ID, Start_Time, End_Time, Status) VALUES
      ('apt-01', 'res-8841', 'spa-01', 'th-01', '2026-10-31 16:00:00', '2026-10-31 17:30:00', 'Scheduled');
    `);

    // 10. Dining / MealPlans and MenuItems
    await connection.query(`
      INSERT INTO MealPlan (Plan_ID, Plan_Name, Price_Per_Day) VALUES
      ('mp-bb', 'Bed & Continental Breakfast', 2500.00),
      ('mp-hb', 'Half Board (Breakfast & Dinner)', 6500.00),
      ('mp-fb', 'All-Inclusive Royal Concierge Board', 12000.00);
    `);

    await connection.query(`
      INSERT INTO MenuItem (Item_ID, Name, Description, Category, Price) VALUES
      ('mi-01', 'Scottish Highland Smoked Salmon', 'Traditional cold-smoked salmon with dill cream', 'Starters', 2200.00),
      ('mi-02', 'Dry-Aged Angus Ribeye Steak (300g)', 'Prime ribeye served with roasted bone marrow sauce', 'Mains', 5400.00),
      ('mi-03', 'Wild Truffle & Porcini Risotto', 'Acquerello rice with fresh black truffle shavings', 'Mains', 3800.00),
      ('mi-04', 'Dom Pérignon Vintage 2013', 'Champagne prestige cuvée bottle', 'Beverages', 28000.00);
    `);

    // 11. Invoices & Payments for sample completed billing
    await connection.query(`
      INSERT INTO Invoice (Invoice_ID, Reservation_ID, Issue_Date, Total_Charges, Discount_Applied, Tax_Applied, Net_Payable) VALUES
      ('inv-8841', 'res-8841', '2026-10-31', 55500.00, 0.00, 0.00, 55500.00);
    `);

    await connection.query(`
      INSERT INTO Payments (Payment_ID, Reservation_ID, Invoice_ID, Amount, Method, Payment_Status) VALUES
      ('pay-01', 'res-8841', 'inv-8841', 55500.00, 'Credit Card', 'Completed');
    `);

    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('Database seeded successfully with all relational tables!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    connection.release();
    process.exit();
  }
}

seedDatabase();
