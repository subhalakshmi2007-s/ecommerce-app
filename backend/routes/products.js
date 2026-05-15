const router = require('express').Router();
const { allQuery, getQuery } = require('../database');

// Get all products
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/products - Fetching products...');
    const products = await allQuery('SELECT * FROM products ORDER BY id');
    console.log(`Found ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error('Error in /api/products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await getQuery('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;