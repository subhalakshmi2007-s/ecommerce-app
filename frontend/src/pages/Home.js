import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Home({ addToCart, API_URL }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log('Fetching from:', `${API_URL}/api/products`);
      const response = await axios.get(`${API_URL}/api/products`);
      console.log('Products received:', response.data);
      setProducts(response.data);
      setFilteredProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(products.map(p => p.category))];

  useEffect(() => {
    let result = [...products];
    
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }
    
    if (searchTerm) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (sortBy === 'price_low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_high') {
      result.sort((a, b) => b.price - a.price);
    }
    
    setFilteredProducts(result);
  }, [selectedCategory, searchTerm, sortBy, products]);

  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div>
      <div className="hero">
        <h1>Welcome to ShopEase</h1>
        <p>Discover {products.length}+ amazing products at best prices!</p>
        <div className="hero-stats">
          <span>📦 {products.length}+ Products</span>
          <span>⭐ 4.5+ Rating</span>
          <span>🚚 Free Shipping</span>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="🔍 Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="sort-box">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="default">Sort by: Default</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="category-tabs">
        {categories.map(cat => (
          <button 
            key={cat}
            className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="results-count">
        Showing {filteredProducts.length} of {products.length} products
      </div>

      <div className="products-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-badge">
              {product.stock < 10 && <span className="badge low-stock">🔥 Low Stock</span>}
              {product.rating >= 4.5 && <span className="badge bestseller">⭐ Bestseller</span>}
            </div>
            <img src={product.image_url} alt={product.name} />
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="category">{product.category}</p>
              <p className="description">{product.description?.substring(0, 60)}...</p>
              <div className="rating">
                {'⭐'.repeat(Math.floor(product.rating || 4))} {product.rating}
              </div>
              <div className="price-cart">
                <div>
                  <span className="price">${product.price}</span>
                </div>
                <Link to={`/product/${product.id}`} className="view-details-btn">View Details</Link>
              </div>
              <button onClick={() => addToCart(product)}>Add to Cart</button>
              <div className="stock-info">In Stock: {product.stock} items</div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="no-results">
          <h3>No products found</h3>
          <p>Try changing your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}

export default Home;