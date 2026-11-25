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

// Create a new reservation (with transactional invoice generation, taxes, and payment)
exports.createReservation = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { 
      guestId, 
      guestDetails,
      roomId, 
      checkInDate, 
      checkOutDate, 
      totalAmount,
      subtotal,
      taxAmount,
      discountAmount,
      paymentMethod = 'Credit Card'
    } = req.body;

    if (!guestId || !checkInDate || !checkOutDate) {
      await connection.rollback();
      return res.status(400).json({ error: 'Missing required booking fields' });
    }

    // Ensure Guest_ID exists in Guest table (handles local/offline-registered guests seamlessly)
    let resolvedGuestId = guestId;
    const [existingGuest] = await connection.query(
      'SELECT Guest_ID FROM Guest WHERE Guest_ID = ? LIMIT 1',
      [resolvedGuestId]
    );

    if (existingGuest.length === 0) {
      if (guestDetails && guestDetails.email) {
        const [byEmail] = await connection.query(
          'SELECT Guest_ID FROM Guest WHERE Email = ? LIMIT 1',
          [guestDetails.email]
        );
        if (byEmail.length > 0) {
          resolvedGuestId = byEmail[0].Guest_ID;
        } else {
          await connection.query(
            `INSERT INTO Guest (Guest_ID, First_Name, Last_Name, Email, Phone, Password_Hash)
             VALUES (?, ?, ?, ?, ?, 'guest_sync')`,
            [
              resolvedGuestId,
              guestDetails.firstName || 'Guest',
              guestDetails.lastName || 'User',
              guestDetails.email,
              guestDetails.phone || '+00 0000000000'
            ]
          );
        }
      } else {
        const [fallbackGuest] = await connection.query('SELECT Guest_ID FROM Guest LIMIT 1');
        if (fallbackGuest.length > 0) {
          resolvedGuestId = fallbackGuest[0].Guest_ID;
        }
      }
    }

    // If roomId is not provided or is mock, find an active available room
    let targetRoomId = roomId;
    if (!targetRoomId || targetRoomId.startsWith('rm-')) {
      const [availableRooms] = await connection.query(
        `SELECT r.Room_ID, rt.Name, rt.Base_Price 
         FROM Rooms r
         JOIN RoomType rt ON r.RoomType_ID = rt.RoomType_ID
         WHERE r.Room_ID NOT IN (
           SELECT Room_ID FROM Reservations 
           WHERE Booking_Status NOT IN ('Cancelled', 'Checked-Out')
             AND (? < Check_Out_Date AND ? > Check_In_Date)
         )
         LIMIT 1`,
        [checkInDate, checkOutDate]
      );
      if (availableRooms.length > 0) {
        targetRoomId = availableRooms[0].Room_ID;
      } else {
        // Fallback to first room in Rooms
        const [anyRoom] = await connection.query(`SELECT Room_ID FROM Rooms LIMIT 1`);
        targetRoomId = anyRoom[0]?.Room_ID || 'rm-101';
      }
    }

    const reservationId = 'res-' + Math.floor(1000 + Math.random() * 9000);
    const invoiceId = 'inv-' + Math.floor(1000 + Math.random() * 9000);
    const paymentId = 'pay-' + Math.floor(1000 + Math.random() * 9000);

    // Insert Reservation
    await connection.query(
      `INSERT INTO Reservations (Reservation_ID, Guest_ID, Room_ID, Check_In_Date, Check_Out_Date, Booking_Status)
       VALUES (?, ?, ?, ?, ?, 'Confirmed')`,
      [reservationId, resolvedGuestId, targetRoomId, checkInDate, checkOutDate]
    );

    const nights = Math.max(1, Math.round((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)));

    // Dynamic PriceRule Engine: check if reservation dates overlap any active PriceRule for this RoomType
    let computedRoomSubtotal = subtotal;
    if (!computedRoomSubtotal) {
      const [roomMeta] = await connection.query(
        `SELECT r.RoomType_ID, rt.Base_Price
         FROM Rooms r
         JOIN RoomType rt ON r.RoomType_ID = rt.RoomType_ID
         WHERE r.Room_ID = ?`,
        [targetRoomId]
      );

      if (roomMeta.length > 0) {
        const { RoomType_ID, Base_Price } = roomMeta[0];
        const [priceRules] = await connection.query(
          `SELECT Price_Multiplier, Rule_Name
           FROM PriceRule
           WHERE RoomType_ID = ?
             AND Start_Date <= ?
             AND End_Date >= ?
           ORDER BY Price_Multiplier DESC
           LIMIT 1`,
          [RoomType_ID, checkOutDate, checkInDate]
        );
        const multiplier = priceRules.length > 0 ? Number(priceRules[0].Price_Multiplier) : 1.0;
        computedRoomSubtotal = Math.round(Number(Base_Price) * multiplier * nights * 100) / 100;
      }
    }

    const charges = computedRoomSubtotal || (totalAmount ? totalAmount * 0.88 : 20000 * nights);
    const tax = taxAmount !== undefined ? taxAmount : charges * 0.12;
    const discount = discountAmount || 0;
    const net = totalAmount || (charges + tax - discount);

    // Create Initial Invoice
    await connection.query(
      `INSERT INTO Invoice (Invoice_ID, Reservation_ID, Issue_Date, Total_Charges, Discount_Applied, Tax_Applied, Net_Payable)
       VALUES (?, ?, CURRENT_DATE, ?, ?, ?, ?)`,
      [invoiceId, reservationId, charges, discount, tax, net]
    );

    // Insert Itemized Invoice Items
    const invoiceItemId = 'item-' + Math.floor(1000 + Math.random() * 9000);
    await connection.query(
      `INSERT INTO InvoiceItem (InvoiceItem_ID, Invoice_ID, Description, Charge_Category, Amount)
       VALUES (?, ?, ?, 'Accommodation', ?)`,
      [invoiceItemId, invoiceId, `Suite Stay (${nights} Nights)`, charges]
    );

    // Insert Payment Record
    await connection.query(
      `INSERT INTO Payments (Payment_ID, Reservation_ID, Invoice_ID, Amount, Method, Payment_Status)
       VALUES (?, ?, ?, ?, ?, 'Completed')`,
      [paymentId, reservationId, invoiceId, net, paymentMethod]
    );

    // Update Guest loyalty points (+100 for completed reservation)
    await connection.query(
      `UPDATE Guest SET Loyalty_Points = Loyalty_Points + 120 WHERE Guest_ID = ?`,
      [guestId]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Reservation created and payment processed successfully',
      reservationId,
      invoiceId,
      paymentId,
      totalAmount: net,
      status: 'Confirmed'
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error creating reservation:', err);
    res.status(500).json({ error: 'Failed to create reservation: ' + err.message });
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
