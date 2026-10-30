const pool = require('../config/db');

// Get all reservations (for staff dashboard)
exports.getAllReservations = async (req, res) => {
  try {
    const { branchId, status } = req.query;

    let query = `
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
    `;
    const params = [];

    if (branchId) {
      query += ` AND r.Branch_ID = ?`;
      params.push(branchId);
    }
    if (status) {
      query += ` AND res.Booking_Status = ?`;
      params.push(status);
    }

    query += ` ORDER BY res.Check_In_Date DESC`;

    const [reservations] = await pool.query(query, params);
    res.json(reservations);
  } catch (err) {
    console.error('Error fetching reservations:', err);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
};

// Create a new reservation (with transactional invoice generation)
exports.createReservation = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { guestId, roomId, checkInDate, checkOutDate, totalAmount } = req.body;

    if (!guestId || !roomId || !checkInDate || !checkOutDate) {
      await connection.rollback();
      return res.status(400).json({ error: 'Missing required booking fields' });
    }

    // Check room availability for the requested date window
    const [conflicts] = await connection.query(
      `SELECT Reservation_ID FROM Reservations 
       WHERE Room_ID = ? 
         AND Booking_Status NOT IN ('Cancelled', 'Checked-Out')
         AND (? < Check_Out_Date AND ? > Check_In_Date)`,
      [roomId, checkInDate, checkOutDate]
    );

    if (conflicts.length > 0) {
      await connection.rollback();
      return res.status(409).json({ error: 'Room is already reserved for the selected dates.' });
    }

    const reservationId = 'res-' + Math.floor(1000 + Math.random() * 9000);
    const invoiceId = 'inv-' + Math.floor(1000 + Math.random() * 9000);

    // Insert Reservation
    await connection.query(
      `INSERT INTO Reservations (Reservation_ID, Guest_ID, Room_ID, Check_In_Date, Check_Out_Date, Booking_Status)
       VALUES (?, ?, ?, ?, ?, 'Confirmed')`,
      [reservationId, guestId, roomId, checkInDate, checkOutDate]
    );

    // Calculate final payable amount (default to room rate * nights if not provided)
    const [roomRows] = await connection.query(
      `SELECT rt.Base_Price FROM Rooms r JOIN RoomType rt ON r.RoomType_ID = rt.RoomType_ID WHERE r.Room_ID = ?`,
      [roomId]
    );
    const nights = Math.max(1, Math.round((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)));
    const calculatedAmount = totalAmount || ((roomRows[0]?.Base_Price || 20000) * nights);

    // Create Initial Invoice
    await connection.query(
      `INSERT INTO Invoice (Invoice_ID, Reservation_ID, Issue_Date, Total_Charges, Discount_Applied, Tax_Applied, Net_Payable)
       VALUES (?, ?, CURRENT_DATE, ?, 0.00, 0.00, ?)`,
      [invoiceId, reservationId, calculatedAmount, calculatedAmount]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Reservation created successfully',
      reservationId,
      invoiceId,
      totalAmount: calculatedAmount
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error creating reservation:', err);
    res.status(500).json({ error: 'Failed to create reservation' });
  } finally {
    connection.release();
  }
};

// Check-in guest
exports.checkIn = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      `UPDATE Reservations SET Booking_Status = 'Checked-In', Actual_Check_In = CURRENT_TIMESTAMP WHERE Reservation_ID = ?`,
      [id]
    );
    res.json({ message: 'Guest checked in successfully', reservationId: id });
  } catch (err) {
    console.error('Check-in error:', err);
    res.status(500).json({ error: 'Failed to process check-in' });
  }
};

// Check-out guest
exports.checkOut = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;

    // 1. Mark reservation as Checked-Out
    const [resRows] = await connection.query(
      `SELECT Room_ID FROM Reservations WHERE Reservation_ID = ?`,
      [id]
    );
    if (resRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const roomId = resRows[0].Room_ID;

    await connection.query(
      `UPDATE Reservations SET Booking_Status = 'Checked-Out', Actual_Check_Out = CURRENT_TIMESTAMP WHERE Reservation_ID = ?`,
      [id]
    );

    // 2. Automatically mark room dirty for housekeeping
    await connection.query(
      `UPDATE Rooms SET Housekeeping_Status = 'Dirty' WHERE Room_ID = ?`,
      [roomId]
    );

    // 3. Create housekeeping task
    const taskId = 'tsk-' + Math.floor(1000 + Math.random() * 9000);
    await connection.query(
      `INSERT INTO HousekeepingTask (Task_ID, Room_ID, Task_Type, Status, Reported_Date)
       VALUES (?, ?, 'Check-Out Turnover & Sanitation', 'Pending', CURRENT_DATE)`,
      [taskId, roomId]
    );

    await connection.commit();
    res.json({ message: 'Guest checked out successfully and housekeeping scheduled', reservationId: id });
  } catch (err) {
    await connection.rollback();
    console.error('Check-out error:', err);
    res.status(500).json({ error: 'Failed to process check-out' });
  } finally {
    connection.release();
  }
};
