import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductSkeleton from '../components/ProductSkeleton';
import { toast } from 'react-hot-toast';

function Home({ addToCart, API_URL }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/products');
      console.log('Products received:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setProducts(response.data);
        setFilteredProducts(response.data);
      } else {
        setProducts([]);
        setFilteredProducts([]);
        setError('Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(products.map(p => p.category))];

  // Enhancement 4: Get category count
  const getCategoryCount = (category) => {
    if (category === 'All') return products.length;
    return products.filter(p => p.category === category).length;
  };

  useEffect(() => {
    let result = [...products];
    
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }
    
    if (searchTerm) {
      result = result.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (sortBy === 'price_low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_high') {
      result.sort((a, b) => b.price - a.price);
    }
    
    setFilteredProducts(result);
  }, [selectedCategory, searchTerm, sortBy, products]);

  // Enhancement 2: Loading Skeleton
  if (loading) {
    return (
      <div className="products-grid">
        {[1,2,3,4,5,6].map(n => <ProductSkeleton key={n} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="no-results">
        <h3>Error loading products</h3>
        <p>{error}</p>
        <button onClick={fetchProducts}>Try Again</button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div>
        <div className="hero">
          <h1>Welcome to ShopEase</h1>
          <p>Discover amazing products at best prices!</p>
        </div>
        <div className="no-results">
          <h3>No products found in database</h3>
          <p>Please check the backend API at: {API_URL}/api/products</p>
          <button onClick={fetchProducts}>Refresh Products</button>
        </div>
      </div>
    );
  }

  // Enhancement 5: Featured products (top rated)
  const featuredProducts = products.filter(p => p.rating >= 4.7).slice(0, 4);

  return (
    <div>
      <div className="hero">
        <h1>Welcome to ShopEase</h1>
        <p>Discover {products.length} amazing products at best prices!</p>
        <div className="hero-stats">
          <span>📦 {products.length}+ Products</span>
          <span>⭐ 4.5+ Rating</span>
          <span>🚚 Free Shipping</span>
        </div>
      </div>

      {/* Enhancement 5: Featured Products Section */}
      {featuredProducts.length > 0 && (
        <div className="featured-section">
          <h2>🌟 Featured Products</h2>
          <div className="featured-grid">
            {featuredProducts.map(product => (
              <div key={product.id} className="featured-card">
                <img src={product.image_url} alt={product.name} />
                <div className="featured-info">
                  <h4>{product.name}</h4>
                  <div className="rating">⭐ {product.rating}</div>
                  <p className="price">${product.price}</p>
                  <button onClick={() => {
                    if (product.stock === 0) {
                      toast.error('Out of stock!');
                      return;
                    }
                    addToCart(product);
                  }}>Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Enhancement 4: Category tabs with counts */}
      <div className="category-tabs">
        {categories.map(cat => (
          <button 
            key={cat}
            className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat} <span className="category-count">({getCategoryCount(cat)})</span>
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
              {product.stock < 10 && product.stock > 0 && <span className="badge low-stock">🔥 Low Stock</span>}
              {product.rating >= 4.5 && <span className="badge bestseller">⭐ Bestseller</span>}
              {/* Enhancement 1: Out of Stock Badge */}
              {product.stock === 0 && <span className="badge out-of-stock">❌ Out of Stock</span>}
            </div>
            <img 
              src={product.image_url} 
              alt={product.name}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=Product'; }}
            />
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
              <button 
                onClick={() => {
                  if (product.stock === 0) {
                    toast.error('Out of stock!');
                    return;
                  }
                  addToCart(product);
                }}
                disabled={product.stock === 0}
                style={product.stock === 0 ? { background: '#ccc', cursor: 'not-allowed' } : {}}
              >
                {product.stock === 0 ? '❌ Out of Stock' : '🛒 Add to Cart'}
              </button>
              <div className="stock-info">
                {product.stock > 0 ? `✅ In Stock: ${product.stock} items` : '❌ Currently Unavailable'}
              </div>
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