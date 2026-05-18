const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { initDB } = require('./database');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

dotenv.config();

const app = express();

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Serve frontend build files
// Try different possible paths for frontend build
const possiblePaths = [
  path.join(__dirname, '../frontend/build'),
  path.join(__dirname, 'frontend/build'),
  path.join(process.cwd(), 'frontend/build')
];

let frontendPath = null;
for (const p of possiblePaths) {
  if (require('fs').existsSync(p)) {
    frontendPath = p;
    console.log(`✅ Found frontend build at: ${frontendPath}`);
    break;
  }
}

if (frontendPath) {
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  console.log('⚠️ Frontend build not found. API routes only.');
}

const PORT = process.env.PORT || 5000;

initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`🌐 Visit: http://localhost:${PORT}`);
  });
});