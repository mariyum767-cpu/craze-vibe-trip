require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'Craze Vibes Trips API is running' }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tours', require('./routes/tourRoutes'));
app.use('/api/durations', require('./routes/durationRoutes'));
app.use('/api/destinations', require('./routes/destinationRoutes'));
app.use('/api/pickup-points', require('./routes/pickupRoutes'));
app.use('/api/seats', require('./routes/seatRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/faqs', require('./routes/faqRoutes'));
app.use('/api/site-content', require('./routes/siteContentRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));

app.use((req, res) => res.status(404).json({ success: false, error: 'Route not found' }));
app.use(errorHandler);

// Only start a listening server when run directly (local dev / traditional hosting).
// On Vercel, api/index.js imports `app` and exports it as a serverless function instead.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Craze Vibes Trips API running on port ${PORT}`));
}

module.exports = app;
