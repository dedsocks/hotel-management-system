const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const housekeepingRoutes = require('./routes/housekeepingRoutes');
const staffRoutes = require('./routes/staffRoutes');
const spaRoutes = require('./routes/spaRoutes');
const couponRoutes = require('./routes/couponRoutes');
const diningRoutes = require('./routes/diningRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Healthcheck & DB test
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ status: 'UP', database: 'Connected', timestamp: new Date() });
  } catch (err) {
    res.status(500).json({ status: 'DOWN', error: err.message });
  }
});

// Mounted Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/housekeeping', housekeepingRoutes);
app.use('/api/operations', staffRoutes);
app.use('/api/spa', spaRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/dining', diningRoutes);

// Fallback error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Hotel Management Backend running on http://localhost:${PORT}`);
});
