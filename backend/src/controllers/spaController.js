const pool = require('../config/db');

// Get all spa services
exports.getAllSpaServices = async (req, res) => {
  try {
    const [services] = await pool.query('SELECT * FROM SpaService ORDER BY Price ASC');
    res.json(services);
  } catch (err) {
    console.error('Error fetching spa services:', err);
    res.status(500).json({ error: 'Failed to fetch spa services' });
  }
};

// Get all available therapists
exports.getTherapists = async (req, res) => {
  try {
    const [therapists] = await pool.query(`
      SELECT t.Therapist_ID, t.Staff_ID, t.Specialty,
             s.First_Name, s.Last_Name, s.Email
      FROM Therapist t
      JOIN Staff s ON t.Staff_ID = s.Staff_ID
    `);
    res.json(therapists);
  } catch (err) {
    console.error('Error fetching therapists:', err);
    res.status(500).json({ error: 'Failed to fetch therapists' });
  }
};

// Get all spa appointments (for POS / Staff portal)
exports.getAllAppointments = async (req, res) => {
  try {
    const [appointments] = await pool.query(`
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
    `);
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Failed to fetch spa appointments' });
  }
};

// Book a new spa appointment (links to active stay reservation or guest's current reservation)
exports.bookSpaAppointment = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { 
      reservationId, 
      guestId,
      serviceId, 
      therapistId, 
      startTime, 
      endTime 
    } = req.body;

    if (!serviceId || (!reservationId && !guestId)) {
      await connection.rollback();
      return res.status(400).json({ error: 'Service ID and an active stay are required' });
    }

    // 1. Verify guest is currently Checked-In at the hotel
    let actualReservationId = null;
    if (reservationId) {
      const [resRows] = await connection.query(
        'SELECT Reservation_ID, Booking_Status FROM Reservations WHERE Reservation_ID = ? LIMIT 1',
        [reservationId]
      );
      if (resRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'Reservation not found' });
      }
      if (resRows[0].Booking_Status !== 'Checked-In') {
        await connection.rollback();
        return res.status(403).json({ error: 'Guest must be currently checked in at the hotel to book spa treatments' });
      }
      actualReservationId = resRows[0].Reservation_ID;
    } else if (guestId) {
      const [guestRes] = await connection.query(
        "SELECT Reservation_ID FROM Reservations WHERE Guest_ID = ? AND Booking_Status = 'Checked-In' ORDER BY Created_At DESC LIMIT 1",
        [guestId]
      );
      if (guestRes.length === 0) {
        await connection.rollback();
        return res.status(403).json({ error: 'You must be currently checked in at the hotel to book spa treatments' });
      }
      actualReservationId = guestRes[0].Reservation_ID;
    }

    // 2. Select therapist if not provided
    let actualTherapistId = therapistId;
    if (!actualTherapistId) {
      const [tRows] = await connection.query('SELECT Therapist_ID FROM Therapist LIMIT 1');
      if (tRows.length > 0) {
        actualTherapistId = tRows[0].Therapist_ID;
      } else {
        return res.status(400).json({ error: 'No therapist available' });
      }
    }

    // 3. Service details & calculate timings
    const [serviceRows] = await connection.query(
      'SELECT Service_ID, Service_Name, Duration_Minutes, Price FROM SpaService WHERE Service_ID = ?',
      [serviceId]
    );
    if (serviceRows.length === 0) {
      return res.status(404).json({ error: 'Spa service not found' });
    }
    const service = serviceRows[0];

    const appointmentId = 'apt-' + Math.floor(1000 + Math.random() * 9000);
    const start = startTime ? new Date(startTime) : new Date(Date.now() + 3600000);
    const end = endTime ? new Date(endTime) : new Date(start.getTime() + service.Duration_Minutes * 60000);

    const formattedStart = start.toISOString().slice(0, 19).replace('T', ' ');
    const formattedEnd = end.toISOString().slice(0, 19).replace('T', ' ');

    // 4. Insert appointment record
    await connection.query(
      `INSERT INTO SpaAppointment (Appointment_ID, Reservation_ID, Service_ID, Therapist_ID, Start_Time, End_Time, Status)
       VALUES (?, ?, ?, ?, ?, ?, 'Scheduled')`,
      [appointmentId, actualReservationId, serviceId, actualTherapistId, formattedStart, formattedEnd]
    );

    // 5. Add to Guest Invoice Item if invoice exists
    const [invRows] = await connection.query(
      'SELECT Invoice_ID FROM Invoice WHERE Reservation_ID = ?',
      [actualReservationId]
    );
    if (invRows.length > 0) {
      const invoiceId = invRows[0].Invoice_ID;
      const itemId = 'item-' + Math.floor(1000 + Math.random() * 9000);
      await connection.query(
        `INSERT INTO InvoiceItem (InvoiceItem_ID, Invoice_ID, Description, Charge_Category, Amount)
         VALUES (?, ?, ?, 'Spa & Wellness', ?)`,
        [itemId, invoiceId, `Spa Session: ${service.Service_Name}`, service.Price]
      );

      // Update Invoice Total Charges and Net Payable
      await connection.query(
        `UPDATE Invoice 
         SET Total_Charges = Total_Charges + ?, 
             Net_Payable = Net_Payable + ? 
         WHERE Invoice_ID = ?`,
        [service.Price, service.Price, invoiceId]
      );
    }

    await connection.commit();

    res.status(201).json({
      message: 'Spa treatment appointment confirmed and room folio updated',
      appointmentId,
      serviceName: service.Service_Name,
      price: service.Price,
      startTime: formattedStart,
      endTime: formattedEnd
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error booking spa appointment:', err);
    res.status(500).json({ error: 'Failed to book spa appointment: ' + err.message });
  } finally {
    connection.release();
  }
};

// Update appointment status (e.g., Completed, Cancelled)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query('UPDATE SpaAppointment SET Status = ? WHERE Appointment_ID = ?', [status, id]);
    res.json({ message: 'Appointment status updated', appointmentId: id, status });
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
};
