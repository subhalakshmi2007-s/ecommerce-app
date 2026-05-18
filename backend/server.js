const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initDB, allQuery, getQuery, runQuery } = require('./database');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ========== SIMPLE TEST ROUTES (Working without external files) ==========

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Ecommerce API is running!',
    endpoints: {
      test: '/api/test',
      health: '/health',
      products: '/api/products',
      login: '/api/auth/login',
      register: '/api/auth/register'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date() });
});

// Test API
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', time: new Date() });
});

// Test products
app.get('/api/products-test', (req, res) => {
  res.json([{ id: 1, name: 'Test Product', price: 99.99 }]);
});

// ========== PRODUCTS API (Direct implementation) ==========
app.get('/api/products', async (req, res) => {
  try {
    const products = await allQuery('SELECT * FROM products ORDER BY id');
    res.json(products);
  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await getQuery('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== AUTH API (Direct implementation) ==========
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existing = await getQuery('SELECT * FROM users WHERE email = ?', [email]);
    if (existing) return res.status(400).json({ error: 'User already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await runQuery(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    
    const user = await getQuery('SELECT id, name, email, role FROM users WHERE id = ?', [result.lastID]);
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET);
    
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await getQuery('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET);
    
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;

initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Health: http://localhost:${PORT}/health`);
    console.log(`📍 Test: http://localhost:${PORT}/api/test`);
    console.log(`📍 Products: http://localhost:${PORT}/api/products`);
  });
}).catch(err => {
  console.error('Database error:', err);
  process.exit(1);
});