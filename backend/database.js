const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');

// Use different database path for production (Render) vs local
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/tmp/ecommerce.db' 
  : path.join(__dirname, 'ecommerce.db');

console.log(`📁 Using database at: ${dbPath}`);

const db = new sqlite3.Database(dbPath);

function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function getQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function initDB() {
  try {
    console.log('📦 Starting database setup...');
    
    // Create users table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user'
      )
    `);
    console.log('✅ Users table created');

    // Create products table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category TEXT,
        stock INTEGER DEFAULT 0,
        image_url TEXT,
        rating REAL DEFAULT 4.5
      )
    `);
    console.log('✅ Products table created');

    // Create orders table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        total REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        address TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('✅ Orders table created');

    // Create order_items table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        product_id INTEGER,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL
      )
    `);
    console.log('✅ Order items table created');

    // Create admin user
    const admin = await getQuery('SELECT * FROM users WHERE email = ?', ['admin@example.com']);
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await runQuery(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin', 'admin@example.com', hashedPassword, 'admin']
      );
      console.log('✅ Admin created: admin@example.com / admin123');
    }

    // Check if products exist
    const count = await getQuery('SELECT COUNT(*) as total FROM products');
    if (count.total === 0) {
      const products = [
        // Electronics
        ['MacBook Pro 16"', 'Apple M2 Pro chip, 16GB RAM, 512GB SSD', 2499.99, 'Electronics', 15, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', 4.8],
        ['Dell XPS 15', 'Intel i7, 32GB RAM, 1TB SSD, 4K Display', 1899.99, 'Electronics', 10, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400', 4.7],
        ['iPhone 15 Pro', 'A17 Pro chip, 256GB, Titanium', 1099.99, 'Electronics', 25, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400', 4.9],
        ['iPhone 17 Pro', 'A19 Pro chip, 512GB, Titanium, 50MP Camera', 1499.99, 'Electronics', 20, 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=400', 5.0],
        ['Samsung Galaxy S24', 'Snapdragon 8 Gen 3, 256GB', 999.99, 'Electronics', 20, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400', 4.6],
        ['Sony Headphones', 'Noise Cancelling Headphones', 399.99, 'Electronics', 30, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400', 4.9],
        ['iPad Pro', 'M2 chip, 256GB, WiFi', 1099.99, 'Electronics', 18, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400', 4.8],
        
        // Clothing
        ['Denim Jacket', 'Classic blue denim jacket', 79.99, 'Clothing', 50, 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400', 4.5],
        ['Summer Dress', 'Floral print maxi dress', 49.99, 'Clothing', 40, 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400', 4.6],
        ['Nike Air Max', 'Running shoes', 129.99, 'Clothing', 35, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 4.7],
        ['Leather Wallet', 'Genuine leather wallet', 29.99, 'Clothing', 100, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400', 4.4],
        ['Cashmere Sweater', 'Premium cashmere sweater', 149.99, 'Clothing', 25, 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=400', 4.8],
        ['Sports Hoodie', 'Cotton blend hoodie', 59.99, 'Clothing', 60, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', 4.5],
        
        // Accessories
        ['Smart Watch', 'GPS, Heart rate monitor', 399.99, 'Accessories', 20, 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400', 4.7],
        ['Wireless Earbuds', 'Noise cancellation earbuds', 89.99, 'Accessories', 45, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400', 4.6],
        ['Phone Case', 'Shockproof phone case', 19.99, 'Accessories', 200, 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400', 4.3],
        ['Laptop Backpack', 'Waterproof backpack', 49.99, 'Accessories', 55, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 4.6],
        ['Sunglasses', 'UV protection sunglasses', 59.99, 'Accessories', 70, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400', 4.4],
        
        // Home
        ['Bed Sheets Set', 'Cotton bed sheets set', 49.99, 'Home', 40, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400', 4.5],
        ['Gaming Chair', 'Ergonomic gaming chair', 249.99, 'Home', 25, 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400', 4.9]
      ];
      
      for (const product of products) {
        await runQuery(
          'INSERT INTO products (name, description, price, category, stock, image_url, rating) VALUES (?, ?, ?, ?, ?, ?, ?)',
          product
        );
      }
      console.log(`✅ ${products.length} products added!`);
    }

    console.log('🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Database error:', error);
  }
}

module.exports = { runQuery, getQuery, allQuery, initDB };