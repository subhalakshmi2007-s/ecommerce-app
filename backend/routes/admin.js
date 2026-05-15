const router = require('express').Router();
const { runQuery, getQuery, allQuery } = require('../database');
const { auth, admin } = require('../middleware/auth');

router.use(auth, admin);

router.get('/products', async (req, res) => {
  const products = await allQuery('SELECT * FROM products');
  res.json(products);
});

router.post('/products', async (req, res) => {
  const { name, description, price, category, stock, image_url } = req.body;
  const result = await runQuery(
    'INSERT INTO products (name, description, price, category, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)',
    [name, description, price, category, stock, image_url || 'https://picsum.photos/300/200']
  );
  const product = await getQuery('SELECT * FROM products WHERE id = ?', [result.lastID]);
  res.json(product);
});

router.put('/products/:id', async (req, res) => {
  const { name, description, price, category, stock, image_url } = req.body;
  await runQuery(
    'UPDATE products SET name=?, description=?, price=?, category=?, stock=?, image_url=? WHERE id=?',
    [name, description, price, category, stock, image_url, req.params.id]
  );
  const product = await getQuery('SELECT * FROM products WHERE id = ?', [req.params.id]);
  res.json(product);
});

router.delete('/products/:id', async (req, res) => {
  await runQuery('DELETE FROM products WHERE id = ?', [req.params.id]);
  res.json({ message: 'Product deleted' });
});

router.get('/orders', async (req, res) => {
  const orders = await allQuery(`
    SELECT o.*, u.name as user_name, u.email 
    FROM orders o 
    JOIN users u ON o.user_id = u.id 
    ORDER BY o.created_at DESC
  `);
  res.json(orders);
});

router.put('/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  await runQuery('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
  res.json({ message: 'Status updated' });
});

router.get('/stats', async (req, res) => {
  const totalProducts = await getQuery('SELECT COUNT(*) as count FROM products');
  const totalOrders = await getQuery('SELECT COUNT(*) as count FROM orders');
  const totalUsers = await getQuery('SELECT COUNT(*) as count FROM users WHERE role = "user"');
  const revenue = await getQuery('SELECT SUM(total) as total FROM orders');
  
  res.json({
    products: totalProducts.count,
    orders: totalOrders.count,
    users: totalUsers.count,
    revenue: revenue.total || 0
  });
});

module.exports = router;