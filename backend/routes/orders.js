const router = require('express').Router();
const { runQuery, getQuery } = require('../database');
const { auth } = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const { items, address } = req.body;
    
    let total = 0;
    for (let item of items) {
      const product = await getQuery('SELECT price FROM products WHERE id = ?', [item.productId]);
      total += product.price * item.quantity;
    }
    
    const orderResult = await runQuery('INSERT INTO orders (user_id, total, address) VALUES (?, ?, ?)', [req.userId, total, address]);
    const orderId = orderResult.lastID;
    
    for (let item of items) {
      const product = await getQuery('SELECT price FROM products WHERE id = ?', [item.productId]);
      await runQuery('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', [orderId, item.productId, item.quantity, product.price]);
    }
    
    res.json({ message: 'Order placed successfully!', orderId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;