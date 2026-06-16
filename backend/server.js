const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Data files
const USERS_FILE = path.join(__dirname, 'users.json');
const PRODUCTS_FILE = path.join(__dirname, 'products.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');

// Initialize data
function initData() {
  if (!fs.existsSync(USERS_FILE)) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    fs.writeFileSync(USERS_FILE, JSON.stringify([
      { id: 1, name: 'Admin', email: 'admin@example.com', password: hashedPassword, role: 'admin' }
    ], null, 2));
  }

  if (!fs.existsSync(PRODUCTS_FILE)) {
    const products = [
      { id: 1, name: 'MacBook Pro 16"', description: 'Apple M2 Pro chip, 16GB RAM', price: 2499, category: 'Electronics', stock: 15, image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', rating: 4.9 },
      { id: 2, name: 'iPhone 15 Pro', description: 'A17 Pro chip, 256GB', price: 1099, category: 'Electronics', stock: 25, image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400', rating: 4.9 },
      { id: 3, name: 'Sony Headphones', description: 'Noise Cancelling', price: 399, category: 'Accessories', stock: 30, image_url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400', rating: 4.8 }
    ];
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  }

  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
  }
}

initData();

// Helper functions
function readUsers() { return JSON.parse(fs.readFileSync(USERS_FILE)); }
function writeUsers(users) { fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2)); }
function readProducts() { return JSON.parse(fs.readFileSync(PRODUCTS_FILE)); }
function readOrders() { return JSON.parse(fs.readFileSync(ORDERS_FILE)); }
function writeOrders(orders) { fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2)); }

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, 'secret123');
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// API Routes
app.get('/api/products', (req, res) => {
  try {
    const products = readProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const users = readUsers();
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
      role: 'user'
    };
    
    users.push(newUser);
    writeUsers(users);
    
    const token = jwt.sign({ userId: newUser.id, role: newUser.role }, 'secret123');
    res.json({ token, user: { id: newUser.id, name, email, role: 'user' } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = readUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id, role: user.role }, 'secret123');
    res.json({ token, user: { id: user.id, name: user.name, email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', authMiddleware, (req, res) => {
  try {
    const { items, address } = req.body;
    const products = readProducts();
    const orders = readOrders();
    
    let total = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const itemTotal = product.price * item.quantity;
        total += itemTotal;
        orderItems.push({
          productId: item.productId,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          image: product.image_url
        });
      }
    }
    
    const newOrder = {
      id: orders.length + 1,
      user_id: req.userId,
      items: orderItems,
      total: total,
      status: 'pending',
      address: address,
      created_at: new Date().toISOString()
    };
    
    orders.push(newOrder);
    writeOrders(orders);
    
    res.json({ message: 'Order placed successfully!', order: newOrder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders/my-orders', authMiddleware, (req, res) => {
  try {
    const orders = readOrders();
    const myOrders = orders.filter(o => o.user_id === req.userId).reverse();
    res.json(myOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/orders/:id/cancel', authMiddleware, (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const orders = readOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orders[orderIndex];
    
    if (order.user_id !== req.userId) {
      return res.status(403).json({ error: 'You can only cancel your own orders' });
    }
    
    if (order.status !== 'pending') {
      return res.status(400).json({ 
        error: `Cannot cancel order with status: ${order.status}. Only pending orders can be cancelled.` 
      });
    }
    
    orders[orderIndex].status = 'cancelled';
    writeOrders(orders);
    
    res.json({ message: 'Order cancelled successfully!', order: orders[orderIndex] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// ========== SERVE FRONTEND ==========
const frontendBuildPath = path.join(__dirname, '../frontend/build');
if (fs.existsSync(frontendBuildPath)) {
  console.log('📁 Serving frontend from:', frontendBuildPath);
  app.use(express.static(frontendBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
} else {
  console.log('⚠️ Frontend build not found at:', frontendBuildPath);
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health: https://ecommerce-backend.onrender.com/health`);
  console.log(`📍 Products: https://ecommerce-backend.onrender.com/api/products`);
});