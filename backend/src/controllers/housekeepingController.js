const pool = require('../config/db');

// Get all housekeeping tasks
exports.getHousekeepingTasks = async (req, res) => {
  try {
    const [tasks] = await pool.query(`
      SELECT ht.Task_ID, ht.Room_ID, ht.Assigned_Staff_ID, ht.Task_Type, ht.Status, ht.Reported_Date,
             r.Room_Number, b.Location_Name,
             CONCAT(s.First_Name, ' ', s.Last_Name) AS Assigned_Staff_Name
      FROM HousekeepingTask ht
      JOIN Rooms r ON ht.Room_ID = r.Room_ID
      JOIN Branch b ON r.Branch_ID = b.Branch_ID
      LEFT JOIN Staff s ON ht.Assigned_Staff_ID = s.Staff_ID
      ORDER BY ht.Reported_Date DESC
    `);
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching housekeeping tasks:', err);
    res.status(500).json({ error: 'Failed to fetch housekeeping tasks' });
  }
};

// Update task status
exports.updateTaskStatus = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      await connection.rollback();
      return res.status(400).json({ error: 'Status is required' });
    }

    const [taskRows] = await connection.query('SELECT Room_ID FROM HousekeepingTask WHERE Task_ID = ?', [id]);
    if (taskRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Task not found' });
    }

    await connection.query('UPDATE HousekeepingTask SET Status = ? WHERE Task_ID = ?', [status, id]);

    // If housekeeping task marked Completed, update room to Clean
    if (status === 'Completed') {
      await connection.query('UPDATE Rooms SET Housekeeping_Status = "Clean" WHERE Room_ID = ?', [taskRows[0].Room_ID]);
    } else if (status === 'In Progress') {
      await connection.query('UPDATE Rooms SET Housekeeping_Status = "Cleaning In Progress" WHERE Room_ID = ?', [taskRows[0].Room_ID]);
    }

    await connection.commit();
    res.json({ message: 'Task status updated', taskId: id, status });
  } catch (err) {
    await connection.rollback();
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Failed to update task status' });
  } finally {
    connection.release();
  }
};

// Create new task
exports.createTask = async (req, res) => {
  try {
    const { roomId, staffId, taskType } = req.body;
    if (!roomId || !taskType) {
      return res.status(400).json({ error: 'Room ID and task type are required' });
    }

    const taskId = 'tsk-' + Math.floor(1000 + Math.random() * 9000);
    await pool.query(
      `INSERT INTO HousekeepingTask (Task_ID, Room_ID, Assigned_Staff_ID, Task_Type, Status, Reported_Date)
       VALUES (?, ?, ?, ?, 'Pending', CURRENT_DATE)`,
      [taskId, roomId, staffId || null, taskType]
    );

    res.status(201).json({ message: 'Task created', taskId });
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
};
