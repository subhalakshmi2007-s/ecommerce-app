const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

// Database setup
const Database = require('better-sqlite3');
const dbPath = process.env.NODE_ENV === 'production' ? '/tmp/ecommerce.db' : path.join(__dirname, 'ecommerce.db');
const db = new Database(dbPath);

// Helper functions
function runQuery(query, params = []) {
  const stmt = db.prepare(query);
  const result = stmt.run(...params);
  return { lastID: result.lastInsertRowid };
}

function getQuery(query, params = []) {
  const stmt = db.prepare(query);
  return stmt.get(...params);
}

function allQuery(query, params = []) {
  const stmt = db.prepare(query);
  return stmt.all(...params);
}

// Initialize database
function initDB() {
  console.log('📦 Setting up database...');
  
  // Create tables
  db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user'
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT,
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    rating REAL DEFAULT 4.5
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    address TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL
  )`);

  // Create admin user
  const admin = getQuery('SELECT * FROM users WHERE email = ?', ['admin@example.com']);
  if (!admin) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    runQuery('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', 
      ['Admin', 'admin@example.com', hashedPassword, 'admin']);
    console.log('✅ Admin created: admin@example.com / admin123');
  }

  // Check if products exist
  const count = getQuery('SELECT COUNT(*) as total FROM products');
  if (count.total === 0) {
    const products = [
      ['MacBook Pro 16"', 'Apple M2 Pro chip, 16GB RAM, 512GB SSD', 2499.99, 'Electronics', 15, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', 4.8],
      ['Dell XPS 15', 'Intel i7, 32GB RAM, 1TB SSD, 4K Display', 1899.99, 'Electronics', 10, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400', 4.7],
      ['iPhone 15 Pro', 'A17 Pro chip, 256GB, Titanium', 1099.99, 'Electronics', 25, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400', 4.9],
      ['iPhone 17 Pro', 'A19 Pro chip, 512GB, Titanium', 1499.99, 'Electronics', 20, 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=400', 5.0],
      ['Samsung Galaxy S24', 'Snapdragon 8 Gen 3, 256GB', 999.99, 'Electronics', 20, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400', 4.6],
      ['Sony Headphones', 'Noise Cancelling Headphones', 399.99, 'Electronics', 30, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400', 4.9],
      ['iPad Pro', 'M2 chip, 256GB, WiFi', 1099.99, 'Electronics', 18, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400', 4.8],
      ['Denim Jacket', 'Classic blue denim jacket', 79.99, 'Clothing', 50, 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400', 4.5],
      ['Summer Dress', 'Floral print maxi dress', 49.99, 'Clothing', 40, 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400', 4.6],
      ['Nike Air Max', 'Running shoes', 129.99, 'Clothing', 35, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 4.7],
      ['Leather Wallet', 'Genuine leather wallet', 29.99, 'Clothing', 100, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400', 4.4],
      ['Cashmere Sweater', 'Premium cashmere sweater', 149.99, 'Clothing', 25, 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=400', 4.8],
      ['Sports Hoodie', 'Cotton blend hoodie', 59.99, 'Clothing', 60, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', 4.5],
      ['Smart Watch', 'GPS, Heart rate monitor', 399.99, 'Accessories', 20, 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400', 4.7],
      ['Wireless Earbuds', 'Noise cancellation earbuds', 89.99, 'Accessories', 45, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400', 4.6],
      ['Phone Case', 'Shockproof phone case', 19.99, 'Accessories', 200, 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400', 4.3],
      ['Laptop Backpack', 'Waterproof backpack', 49.99, 'Accessories', 55, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 4.6],
      ['Sunglasses', 'UV protection sunglasses', 59.99, 'Accessories', 70, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400', 4.4],
      ['Bed Sheets Set', 'Cotton bed sheets set', 49.99, 'Home', 40, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400', 4.5],
      ['Gaming Chair', 'Ergonomic gaming chair', 249.99, 'Home', 25, 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400', 4.9]
    ];
    
    for (const product of products) {
      runQuery(
        'INSERT INTO products (name, description, price, category, stock, image_url, rating) VALUES (?, ?, ?, ?, ?, ?, ?)',
        product
      );
    }
    console.log(`✅ ${products.length} products added`);
  }
  
  console.log('🎉 Database ready');
}

const app = express();
app.use(cors());
app.use(express.json());

// ========== API ROUTES ==========

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date() });
});

// Root API info
app.get('/api', (req, res) => {
  res.json({
    message: 'Ecommerce API is running',
    endpoints: {
      products: '/api/products',
      login: '/api/auth/login',
      register: '/api/auth/register',
      health: '/health'
    }
  });
});

// Products routes
app.get('/api/products', async (req, res) => {
  try {
    const products = allQuery('SELECT * FROM products ORDER BY id');
    res.json(products);
  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = getQuery('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existing = getQuery('SELECT * FROM users WHERE email = ?', [email]);
    if (existing) return res.status(400).json({ error: 'User already exists' });
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = runQuery('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
    const user = getQuery('SELECT id, name, email, role FROM users WHERE id = ?', [result.lastID]);
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET);
    
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = getQuery('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Order routes
app.post('/api/orders', async (req, res) => {
  try {
    const { items, address, userId } = req.body;
    
    let total = 0;
    for (const item of items) {
      const product = getQuery('SELECT price FROM products WHERE id = ?', [item.productId]);
      total += product.price * item.quantity;
    }
    
    const orderResult = runQuery('INSERT INTO orders (user_id, total, address) VALUES (?, ?, ?)', [userId, total, address]);
    const orderId = orderResult.lastID;
    
    for (const item of items) {
      const product = getQuery('SELECT price FROM products WHERE id = ?', [item.productId]);
      runQuery('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', [orderId, item.productId, item.quantity, product.price]);
    }
    
    res.json({ message: 'Order placed successfully!', orderId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders/my-orders', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const orders = allQuery('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [decoded.userId]);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin routes
app.get('/api/admin/products', async (req, res) => {
  const products = allQuery('SELECT * FROM products');
  res.json(products);
});

app.post('/api/admin/products', async (req, res) => {
  const { name, description, price, category, stock, image_url } = req.body;
  const result = runQuery(
    'INSERT INTO products (name, description, price, category, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)',
    [name, description, price, category, stock, image_url || 'https://picsum.photos/300/200']
  );
  const product = getQuery('SELECT * FROM products WHERE id = ?', [result.lastID]);
  res.json(product);
});

app.put('/api/admin/products/:id', async (req, res) => {
  const { name, description, price, category, stock, image_url } = req.body;
  runQuery(
    'UPDATE products SET name=?, description=?, price=?, category=?, stock=?, image_url=? WHERE id=?',
    [name, description, price, category, stock, image_url, req.params.id]
  );
  const product = getQuery('SELECT * FROM products WHERE id = ?', [req.params.id]);
  res.json(product);
});

app.delete('/api/admin/products/:id', async (req, res) => {
  runQuery('DELETE FROM products WHERE id = ?', [req.params.id]);
  res.json({ message: 'Product deleted' });
});

app.get('/api/admin/orders', async (req, res) => {
  const orders = allQuery(`
    SELECT o.*, u.name as user_name, u.email 
    FROM orders o 
    JOIN users u ON o.user_id = u.id 
    ORDER BY o.created_at DESC
  `);
  res.json(orders);
});

app.put('/api/admin/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  runQuery('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
  res.json({ message: 'Status updated' });
});

app.get('/api/admin/stats', async (req, res) => {
  const totalProducts = getQuery('SELECT COUNT(*) as count FROM products');
  const totalOrders = getQuery('SELECT COUNT(*) as count FROM orders');
  const totalUsers = getQuery('SELECT COUNT(*) as count FROM users WHERE role = "user"');
  const revenue = getQuery('SELECT SUM(total) as total FROM orders');
  
  res.json({
    products: totalProducts.count,
    orders: totalOrders.count,
    users: totalUsers.count,
    revenue: revenue.total || 0
  });
});

// ========== SERVE FRONTEND ==========
// Try multiple possible paths for frontend build
const possiblePaths = [
  path.join(__dirname, '../frontend/build'),
  path.join(__dirname, 'frontend/build'),
  path.join(process.cwd(), 'frontend/build')
];

let frontendPath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    frontendPath = p;
    console.log(`✅ Found frontend at: ${frontendPath}`);
    break;
  }
}

if (frontendPath) {
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    // Don't interfere with API routes
    if (req.path.startsWith('/api/') || req.path === '/health') {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  console.log('⚠️ Frontend build not found. API only mode.');
}

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;

// Initialize database and start server
initDB();
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 Products API: http://localhost:${PORT}/api/products`);
  if (frontendPath) {
    console.log(`📍 Frontend served from: ${frontendPath}`);
  }
});