const pool = require('../config/db');

// Overall property and management metrics
exports.getAnalytics = async (req, res) => {
  try {
    const [[roomsCount]] = await pool.query('SELECT COUNT(*) AS totalRooms FROM Rooms');
    const [[occupiedCount]] = await pool.query(
      `SELECT COUNT(DISTINCT Room_ID) AS occupiedRooms 
       FROM Reservations 
       WHERE Booking_Status = 'Checked-In'`
    );
    const [[pendingCleanCount]] = await pool.query(
      `SELECT COUNT(*) AS pendingCleaning 
       FROM Rooms 
       WHERE Housekeeping_Status IN ('Dirty', 'Cleaning In Progress')`
    );
    const [[revenueTotal]] = await pool.query(
      `SELECT COALESCE(SUM(Net_Payable), 0) AS totalRevenue 
       FROM Invoice`
    );

    // Revenue by branch
    const [branchStats] = await pool.query(`
      SELECT b.Branch_ID, b.Location_Name, 
             COUNT(DISTINCT r.Room_ID) AS roomCount,
             COALESCE(SUM(inv.Net_Payable), 0) AS branchRevenue
      FROM Branch b
      LEFT JOIN Rooms r ON b.Branch_ID = r.Branch_ID
      LEFT JOIN Reservations res ON r.Room_ID = res.Room_ID
      LEFT JOIN Invoice inv ON res.Reservation_ID = inv.Reservation_ID
      GROUP BY b.Branch_ID, b.Location_Name
    `);

    const occupancyRate = roomsCount.totalRooms > 0 
      ? Math.round((occupiedCount.occupiedRooms / roomsCount.totalRooms) * 100) 
      : 0;

    res.json({
      totalRooms: roomsCount.totalRooms,
      occupiedRooms: occupiedCount.occupiedRooms,
      occupancyRate,
      pendingCleaning: pendingCleanCount.pendingCleaning,
      totalRevenue: revenueTotal.totalRevenue,
      branchStats
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Failed to fetch analytics metrics' });
  }
};
