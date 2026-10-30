const pool = require('../config/db');

// Get all staff members with branch and role specialization details
exports.getAllStaff = async (req, res) => {
  try {
    const { branchId, role } = req.query;

    let query = `
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
    `;
    const params = [];

    if (branchId) {
      query += ` AND s.Branch_ID = ?`;
      params.push(branchId);
    }
    if (role) {
      query += ` AND s.Role = ?`;
      params.push(role);
    }

    query += ` ORDER BY s.Role ASC, s.First_Name ASC`;

    const [staff] = await pool.query(query, params);
    res.json(staff);
  } catch (err) {
    console.error('Error fetching staff:', err);
    res.status(500).json({ error: 'Failed to fetch staff directory' });
  }
};

// Get all guests
exports.getAllGuests = async (req, res) => {
  try {
    const [guests] = await pool.query(`
      SELECT g.Guest_ID, g.First_Name, g.Last_Name, g.Email, g.Phone,
             g.Loyalty_Points, g.Loyalty_Tier, g.Account_Status, g.Special_Requests, g.Created_At,
             COUNT(res.Reservation_ID) AS Total_Bookings
      FROM Guest g
      LEFT JOIN Reservations res ON g.Guest_ID = res.Guest_ID
      GROUP BY g.Guest_ID
      ORDER BY g.Loyalty_Points DESC
    `);
    res.json(guests);
  } catch (err) {
    console.error('Error fetching guests:', err);
    res.status(500).json({ error: 'Failed to fetch guest list' });
  }
};// Get all invoices with reservation, guest, and payment status details
exports.getAllInvoices = async (req, res) => {
  try {
    const [invoices] = await pool.query(`
      SELECT inv.Invoice_ID, inv.Reservation_ID, inv.Issue_Date, 
             inv.Total_Charges, inv.Tax_Applied AS Tax_Amount, inv.Discount_Applied AS Discount, inv.Net_Payable,
             res.Check_In_Date, res.Check_Out_Date, res.Booking_Status,
             CONCAT(g.First_Name, ' ', g.Last_Name) AS Guest_Name,
             g.Email AS Guest_Email,
             p.Payment_ID, p.Method AS Payment_Method, p.Payment_Status, p.Payment_Date
      FROM Invoice inv
      JOIN Reservations res ON inv.Reservation_ID = res.Reservation_ID
      JOIN Guest g ON res.Guest_ID = g.Guest_ID
      LEFT JOIN Payments p ON inv.Invoice_ID = p.Invoice_ID
      ORDER BY inv.Issue_Date DESC, inv.Invoice_ID DESC
    `);
    res.json(invoices);
  } catch (err) {
    console.error('Error fetching invoices:', err);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};
