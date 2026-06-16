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
  // Users
  if (!fs.existsSync(USERS_FILE)) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    fs.writeFileSync(USERS_FILE, JSON.stringify([
      { id: 1, name: 'Admin', email: 'admin@example.com', password: hashedPassword, role: 'admin' }
    ], null, 2));
    console.log('✅ Admin created: admin@example.com / admin123');
  }

  // Products
  if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([
      { id: 1, name: 'MacBook Pro', description: 'Powerful laptop for professionals', price: 1999, category: 'Electronics', stock: 10, image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300', rating: 4.5 },
      { id: 2, name: 'iPhone 15 Pro', description: 'Latest smartphone with amazing camera', price: 999, category: 'Electronics', stock: 20, image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300', rating: 4.8 },
      { id: 3, name: 'Sony Headphones', description: 'Wireless noise-cancelling headphones', price: 299, category: 'Accessories', stock: 15, image_url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=300', rating: 4.6 },
      { id: 4, name: 'Smart Watch', description: 'Fitness tracker with heart rate monitor', price: 399, category: 'Accessories', stock: 25, image_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300', rating: 4.4 }
    ], null, 2));
    console.log('✅ Sample products created');
  }

  // Orders
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
    console.log('✅ Orders file created');
  }
}

initData();

// Helper functions
function readUsers() { return JSON.parse(fs.readFileSync(USERS_FILE)); }
function writeUsers(users) { fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2)); }
function readProducts() { return JSON.parse(fs.readFileSync(PRODUCTS_FILE)); }
function writeProducts(products) { fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2)); }
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

// Routes
app.get('/api/products', (req, res) => {
  const products = readProducts();
  res.json(products);
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log('Register attempt:', { name, email });
    
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
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', email);
    
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

// Create Order
app.post('/api/orders', authMiddleware, (req, res) => {
  try {
    const { items, address } = req.body;
    const products = readProducts();
    const orders = readOrders();
    
    // Calculate total
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
    
    console.log(`✅ Order created: #${newOrder.id} for user ${req.userId}`);
    res.json({ message: 'Order placed successfully!', order: newOrder });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get My Orders
app.get('/api/orders/my-orders', authMiddleware, (req, res) => {
  try {
    const orders = readOrders();
    const myOrders = orders.filter(o => o.user_id === req.userId).reverse();
    res.json(myOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// FIXED: Cancel Order Route
app.put('/api/orders/:id/cancel', authMiddleware, (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    console.log(`Cancelling order #${orderId} for user ${req.userId}`);
    
    const orders = readOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      console.log('Order not found');
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orders[orderIndex];
    
    // Check if order belongs to the user
    if (order.user_id !== req.userId) {
      console.log(`Unauthorized: User ${req.userId} trying to cancel order of user ${order.user_id}`);
      return res.status(403).json({ error: 'You can only cancel your own orders' });
    }
    
    // Check if order can be cancelled
    if (order.status !== 'pending') {
      console.log(`Cannot cancel order with status: ${order.status}`);
      return res.status(400).json({ 
        error: `Cannot cancel order with status: ${order.status}. Only pending orders can be cancelled.` 
      });
    }
    
    // Cancel the order
    orders[orderIndex].status = 'cancelled';
    orders[orderIndex].cancelled_at = new Date().toISOString();
    writeOrders(orders);
    
    console.log(`✅ Order #${orderId} cancelled successfully`);
    res.json({ 
      message: 'Order cancelled successfully!',
      order: orders[orderIndex]
    });
    
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get all orders
app.get('/api/admin/orders', authMiddleware, (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }
  
  const orders = readOrders();
  const users = readUsers();
  
  const ordersWithUsers = orders.map(order => {
    const user = users.find(u => u.id === order.user_id);
    return {
      ...order,
      user_name: user?.name || 'Unknown',
      user_email: user?.email || 'Unknown'
    };
  });
  
  res.json(ordersWithUsers);
});

// Admin: Update order status
app.put('/api/admin/orders/:id/status', authMiddleware, (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }
  
  const { status } = req.body;
  const orders = readOrders();
  const orderIndex = orders.findIndex(o => o.id === parseInt(req.params.id));
  
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  orders[orderIndex].status = status;
  writeOrders(orders);
  
  res.json({ message: 'Order status updated', order: orders[orderIndex] });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 API endpoints:`);
  console.log(`   GET  /api/products`);
  console.log(`   POST /api/auth/register`);
  console.log(`   POST /api/auth/login`);
  console.log(`   POST /api/orders`);
  console.log(`   GET  /api/orders/my-orders`);
  console.log(`   PUT  /api/orders/:id/cancel`);
});