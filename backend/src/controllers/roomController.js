const pool = require('../config/db');

// Get all rooms with room type details and amenities
exports.getAllRooms = async (req, res) => {
  try {
    const { branchId, status, roomType } = req.query;

    let query = `
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
    `;
    const params = [];

    if (branchId) {
      query += ` AND r.Branch_ID = ?`;
      params.push(branchId);
    }
    if (roomType) {
      query += ` AND r.RoomType_ID = ?`;
      params.push(roomType);
    }

    query += ` ORDER BY r.Room_Number ASC`;

    const [rooms] = await pool.query(query, params);

    // Retrieve amenities for each room
    const [amenities] = await pool.query(`SELECT Room_ID, Amenity_Name FROM Room_Amenities`);
    const amenityMap = {};
    amenities.forEach(a => {
      if (!amenityMap[a.Room_ID]) amenityMap[a.Room_ID] = [];
      amenityMap[a.Room_ID].push(a.Amenity_Name);
    });

    const enriched = rooms.map(room => {
      let derivedStatus = 'Available';
      if (room.Booking_Status === 'Checked-In') {
        derivedStatus = 'Occupied';
      } else if (room.Housekeeping_Status === 'Dirty' || room.Housekeeping_Status === 'Cleaning In Progress') {
        derivedStatus = 'Maintenance';
      }

      return {
        ...room,
        Status: derivedStatus,
        Amenities: amenityMap[room.Room_ID] || []
      };
    });

    if (status) {
      return res.json(enriched.filter(r => r.Status.toLowerCase() === status.toLowerCase()));
    }

    res.json(enriched);
  } catch (err) {
    console.error('Error fetching rooms:', err);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

// Update Room Housekeeping Status
exports.updateHousekeepingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { housekeepingStatus } = req.body;

    if (!housekeepingStatus) {
      return res.status(400).json({ error: 'housekeepingStatus is required' });
    }

    await pool.query(
      `UPDATE Rooms SET Housekeeping_Status = ? WHERE Room_ID = ?`,
      [housekeepingStatus, id]
    );

    res.json({ message: 'Housekeeping status updated', roomId: id, housekeepingStatus });
  } catch (err) {
    console.error('Error updating room:', err);
    res.status(500).json({ error: 'Failed to update housekeeping status' });
  }
};

// Get Room Types
exports.getRoomTypes = async (req, res) => {
  try {
    const [types] = await pool.query('SELECT * FROM RoomType ORDER BY Base_Price ASC');
    res.json(types);
  } catch (err) {
    console.error('Error fetching room types:', err);
    res.status(500).json({ error: 'Failed to fetch room types' });
  }
};

// Get Branches
exports.getBranches = async (req, res) => {
  try {
    const [branches] = await pool.query('SELECT * FROM Branch ORDER BY Location_Name ASC');
    res.json(branches);
  } catch (err) {
    console.error('Error fetching branches:', err);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
};
