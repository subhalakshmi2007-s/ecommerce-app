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

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// ========== SIMPLE TEST ROUTES (Put here - BEFORE other routes) ==========
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', time: new Date() });
});

app.get('/api/products-test', (req, res) => {
  res.json([{ id: 1, name: 'Test Product', price: 99.99 }]);
});
// ========== END TEST ROUTES ==========

// ========== API ROUTES ==========
// Auth routes
app.use('/api/auth', authRoutes);

// Product routes
app.use('/api/products', productRoutes);

// Order routes
app.use('/api/orders', orderRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// ========== HEALTH & ROOT ROUTES ==========
// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date() });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Ecommerce API is running',
    endpoints: {
      test: '/api/test',
      health: '/health',
      products: '/api/products',
      productsTest: '/api/products-test',
      auth: '/api/auth/login',
      admin: '/api/admin'
    }
  });
});

// Simple test
app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// ========== SERVE FRONTEND (if build exists) ==========
const frontendPath = path.join(__dirname, '../frontend/build');
const fs = require('fs');

if (fs.existsSync(frontendPath)) {
  console.log('✅ Serving frontend from:', frontendPath);
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  console.log('⚠️ Frontend build not found at:', frontendPath);
  console.log('API routes only available at /api/*');
}

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;

initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Test API: http://localhost:${PORT}/api/test`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📍 Products API: http://localhost:${PORT}/api/products`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});