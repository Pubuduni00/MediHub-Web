const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const dotenv   = require('dotenv');

// Load env variables
dotenv.config();

// Import DB connection test
const { testConnection } = require('./config/db');

// Import routes
const authRoutes         = require('./routes/authRoutes');
const patientRoutes      = require('./routes/patientRoutes');
const doctorRoutes       = require('./routes/doctorRoutes');
const appointmentRoutes  = require('./routes/appointmentRoutes');
const patientLogRoutes   = require('./routes/patientLogRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const alertRoutes        = require('./routes/alertRoutes');
const symptomRoutes      = require('./routes/symptomRoutes');

// Import error middleware
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();

// ── Security & Logging ──
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// ── CORS — allow React frontend ──
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body Parsers ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MediHub API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ──
app.use('/api/auth',          authRoutes);
app.use('/api/patients',      patientRoutes);
app.use('/api/doctors',       doctorRoutes);
app.use('/api/appointments',  appointmentRoutes);
app.use('/api/logs',          patientLogRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/alerts',        alertRoutes);
app.use('/api/symptoms',      symptomRoutes);

// ── Error Handling ──
app.use(notFound);
app.use(errorHandler);

// ── Start Server ──
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Test DB connection before starting
  await testConnection();

  app.listen(PORT, () => {
    console.log('');
    console.log('========================================');
    console.log(`  MediHub API running on port ${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV}`);
    console.log(`  URL: http://localhost:${PORT}`);
    console.log(`  Health: http://localhost:${PORT}/api/health`);
    console.log('========================================');
    console.log('');
  });
};

startServer();
