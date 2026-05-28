const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// JSON file paths for data storage
const DATA_DIR = process.env.RENDER ? '/tmp' : __dirname;
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Initialize all data files
function initData() {
  console.log('📦 Initializing data files...');
  
  // Initialize Users
  if (!fs.existsSync(USERS_FILE)) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    const users = [
      { id: 1, name: 'Admin', email: 'admin@example.com', password: hashedPassword, role: 'admin' }
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    console.log('✅ Admin user created');
  } else {
    console.log('✅ Users file exists');
  }
  
  // Initialize Products with 20 items
  if (!fs.existsSync(PRODUCTS_FILE)) {
    const products = [
      { id: 1, name: 'MacBook Pro 16"', description: 'Apple M2 Pro chip, 16GB RAM, 512GB SSD', price: 2499.99, category: 'Electronics', stock: 15, image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', rating: 4.8 },
      { id: 2, name: 'Dell XPS 15', description: 'Intel i7, 32GB RAM, 1TB SSD, 4K Display', price: 1899.99, category: 'Electronics', stock: 10, image_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400', rating: 4.7 },
      { id: 3, name: 'iPhone 15 Pro', description: 'A17 Pro chip, 256GB, Titanium', price: 1099.99, category: 'Electronics', stock: 25, image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400', rating: 4.9 },
      { id: 4, name: 'iPhone 17 Pro', description: 'A19 Pro chip, 512GB, Titanium', price: 1499.99, category: 'Electronics', stock: 20, image_url: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=400', rating: 5.0 },
      { id: 5, name: 'Samsung Galaxy S24', description: 'Snapdragon 8 Gen 3, 256GB', price: 999.99, category: 'Electronics', stock: 20, image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400', rating: 4.6 },
      { id: 6, name: 'Sony WH-1000XM5', description: 'Noise Cancelling Headphones', price: 399.99, category: 'Electronics', stock: 30, image_url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400', rating: 4.9 },
      { id: 7, name: 'iPad Pro 12.9"', description: 'M2 chip, 256GB, WiFi', price: 1099.99, category: 'Electronics', stock: 18, image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400', rating: 4.8 },
      { id: 8, name: 'Denim Jacket', description: 'Classic blue denim jacket', price: 79.99, category: 'Clothing', stock: 50, image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400', rating: 4.5 },
      { id: 9, name: 'Summer Dress', description: 'Floral print maxi dress', price: 49.99, category: 'Clothing', stock: 40, image_url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400', rating: 4.6 },
      { id: 10, name: 'Nike Air Max', description: 'Running shoes', price: 129.99, category: 'Clothing', stock: 35, image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', rating: 4.7 },
      { id: 11, name: 'Leather Wallet', description: 'Genuine leather wallet', price: 29.99, category: 'Clothing', stock: 100, image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400', rating: 4.4 },
      { id: 12, name: 'Cashmere Sweater', description: 'Premium cashmere sweater', price: 149.99, category: 'Clothing', stock: 25, image_url: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=400', rating: 4.8 },
      { id: 13, name: 'Sports Hoodie', description: 'Cotton blend hoodie', price: 59.99, category: 'Clothing', stock: 60, image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', rating: 4.5 },
      { id: 14, name: 'Smart Watch Ultra', description: 'GPS, Heart rate monitor', price: 399.99, category: 'Accessories', stock: 20, image_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400', rating: 4.7 },
      { id: 15, name: 'Wireless Earbuds', description: 'Noise cancellation, 24hr battery', price: 89.99, category: 'Accessories', stock: 45, image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400', rating: 4.6 },
      { id: 16, name: 'Phone Case', description: 'Shockproof, clear design', price: 19.99, category: 'Accessories', stock: 200, image_url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400', rating: 4.3 },
      { id: 17, name: 'Laptop Backpack', description: 'Waterproof, 15.6 inch', price: 49.99, category: 'Accessories', stock: 55, image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', rating: 4.6 },
      { id: 18, name: 'Sunglasses', description: 'UV protection, polarized', price: 59.99, category: 'Accessories', stock: 70, image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400', rating: 4.4 },
      { id: 19, name: 'Bed Sheets Set', description: '100% Egyptian cotton', price: 49.99, category: 'Home', stock: 40, image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400', rating: 4.5 },
      { id: 20, name: 'Gaming Chair', description: 'Ergonomic racing style', price: 249.99, category: 'Home', stock: 25, image_url: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400', rating: 4.9 }
    ];
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    console.log(`✅ ${products.length} products added!`);
  } else {
    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE));
    console.log(`✅ Products file exists with ${products.length} products`);
  }
  
  // Initialize Orders
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
    console.log('✅ Orders file created');
  }
  
  console.log('🎉 Data initialization complete!');
}

// Helper functions
function readUsers() {
  const data = fs.readFileSync(USERS_FILE);
  return JSON.parse(data);
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function readProducts() {
  const data = fs.readFileSync(PRODUCTS_FILE);
  return JSON.parse(data);
}

function writeProducts(products) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

function readOrders() {
  const data = fs.readFileSync(ORDERS_FILE);
  return JSON.parse(data);
}

function writeOrders(orders) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

// Initialize data
initData();

// ========== API ROUTES ==========

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date() });
});

// Get all products
app.get('/api/products', (req, res) => {
  const products = readProducts();
  console.log(`📦 API: Returning ${products.length} products`);
  res.json(products);
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  const products = readProducts();
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// Register - Fixed version
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log('Registration attempt:', { name, email, passwordLength: password?.length });
    
    const users = readUsers();
    
    // Check if user exists
    const existing = users.find(u => u.email === email);
    if (existing) {
      console.log('User already exists:', email);
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');
    
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
      role: 'user'
    };
    users.push(newUser);
    writeUsers(users);
    
    // Create token
    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('User registered successfully:', email);
    res.json({ 
      token, 
      user: { 
        id: newUser.id, 
        name: newUser.name, 
        email: newUser.email, 
        role: newUser.role 
      } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login - Fixed version
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);
    
    const users = readUsers();
    console.log('Total users in DB:', users.length);
    
    const user = users.find(u => u.email === email);
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    console.log('User found, comparing passwords...');
    const valid = bcrypt.compareSync(password, user.password);
    
    if (!valid) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    console.log('Login successful for:', email);
    
    const token = jwt.sign(
      { userId: user.id, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Place order
app.post('/api/orders', (req, res) => {
  try {
    const { items, address, userId } = req.body;
    const products = readProducts();
    const orders = readOrders();
    
    let total = 0;
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        total += product.price * item.quantity;
      }
    }
    
    const newOrder = {
      id: orders.length + 1,
      user_id: userId,
      total,
      status: 'pending',
      address,
      created_at: new Date().toISOString()
    };
    orders.push(newOrder);
    writeOrders(orders);
    
    res.json({ message: 'Order placed successfully!', orderId: newOrder.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get my orders
app.get('/api/orders/my-orders', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const orders = readOrders();
    const myOrders = orders.filter(o => o.user_id === decoded.userId);
    res.json(myOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel order (User can cancel only pending orders)
app.put('/api/orders/:id/cancel', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const orders = readOrders();
    const orderIndex = orders.findIndex(o => o.id === parseInt(req.params.id));
    
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if order belongs to the user
    if (orders[orderIndex].user_id !== decoded.userId) {
      return res.status(403).json({ error: 'You can only cancel your own orders' });
    }
    
    // Check if order can be cancelled (only pending orders)
    if (orders[orderIndex].status !== 'pending') {
      return res.status(400).json({ error: `Cannot cancel order with status: ${orders[orderIndex].status}. Only pending orders can be cancelled.` });
    }
    
    // Update order status to cancelled
    orders[orderIndex].status = 'cancelled';
    writeOrders(orders);
    
    res.json({ message: 'Order cancelled successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin routes
app.get('/api/admin/products', (req, res) => {
  const products = readProducts();
  res.json(products);
});

app.post('/api/admin/products', (req, res) => {
  const products = readProducts();
  const { name, description, price, category, stock, image_url } = req.body;
  const newProduct = {
    id: products.length + 1,
    name,
    description,
    price: parseFloat(price),
    category,
    stock: parseInt(stock),
    image_url: image_url || 'https://picsum.photos/300/200',
    rating: 4.5
  };
  products.push(newProduct);
  writeProducts(products);
  res.json(newProduct);
});

app.put('/api/admin/products/:id', (req, res) => {
  const products = readProducts();
  const { name, description, price, category, stock, image_url } = req.body;
  const index = products.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Product not found' });
  
  products[index] = { 
    ...products[index], 
    name, 
    description, 
    price: parseFloat(price), 
    category, 
    stock: parseInt(stock), 
    image_url 
  };
  writeProducts(products);
  res.json(products[index]);
});

app.delete('/api/admin/products/:id', (req, res) => {
  let products = readProducts();
  products = products.filter(p => p.id !== parseInt(req.params.id));
  writeProducts(products);
  res.json({ message: 'Product deleted' });
});

app.get('/api/admin/orders', (req, res) => {
  const orders = readOrders();
  const users = readUsers();
  const ordersWithUsers = orders.map(o => {
    const user = users.find(u => u.id === o.user_id);
    return { ...o, user_name: user?.name, user_email: user?.email };
  });
  res.json(ordersWithUsers);
});

app.put('/api/admin/orders/:id/status', (req, res) => {
  const orders = readOrders();
  const { status } = req.body;
  const index = orders.findIndex(o => o.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Order not found' });
  
  orders[index].status = status;
  writeOrders(orders);
  res.json({ message: 'Status updated' });
});

app.get('/api/admin/stats', (req, res) => {
  const products = readProducts();
  const orders = readOrders();
  const users = readUsers();
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  
  res.json({
    products: products.length,
    orders: orders.length,
    users: users.filter(u => u.role === 'user').length,
    revenue
  });
});

// ========== SERVE FRONTEND ==========
const frontendPath = path.join(__dirname, '../frontend/build');
if (fs.existsSync(frontendPath)) {
  console.log('✅ Serving frontend from:', frontendPath);
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/') || req.path === '/health') {
      return;
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  console.log('⚠️ Frontend build not found at:', frontendPath);
  app.get('/', (req, res) => {
    res.json({ message: 'API is running. Frontend not built yet.' });
  });
}

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`📍 Products: http://localhost:${PORT}/api/products`);
  const products = readProducts();
  console.log(`📊 Total products available: ${products.length}`);
});