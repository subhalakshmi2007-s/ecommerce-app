import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

function Home({ addToCart, API_URL }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);
  const scrollContainerRef = useRef(null);

  const hotDealsProducts = products;

  useEffect(() => {
    fetchProducts();
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/products`);
      console.log('Products:', response.data);
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load products');
    } finally {
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
        p.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredProducts(result);
  }, [selectedCategory, searchTerm, products]);

  const handleAddToCart = (product) => {
    if (!user) {
      toast.error('Please login first');
      return;
    }
    addToCart(product);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 20);
      setShowRightScroll(scrollLeft + clientWidth < scrollWidth - 20);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container && hotDealsProducts.length > 0) {
      container.addEventListener('scroll', checkScrollButtons);
      checkScrollButtons();
      return () => container.removeEventListener('scroll', checkScrollButtons);
    }
  }, [hotDealsProducts]);

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="hero">
        <h1>Welcome to ShopEase</h1>
        <p>Discover {products.length} amazing products at best prices!</p>
        <div className="hero-stats">
          <span>📦 {products.length}+ Products</span>
          <span>⭐ 4.5+ Rating</span>
          <span>🚚 Free Shipping</span>
        </div>
      </div>

      {/* ========== NEW BANNER BETWEEN HEADER AND HOT DEALS ========== */}
      <div className="promo-banner">
        <div className="promo-banner-content">
          <div className="promo-text">
            <span className="promo-badge">🎉 SPECIAL OFFER 🎉</span>
            <h2>Summer Sale is Live!</h2>
            <p>Get up to <span className="discount-highlight">40% OFF</span> on selected items</p>
            <div className="promo-timer">
              <span>⏰ Offer ends in:</span>
              <div className="timer">
                <span>02</span>:<span>15</span>:<span>30</span>
              </div>
            </div>
            <button className="promo-btn" onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}>
              Shop Now → 
            </button>
          </div>
          <div className="promo-image">
            <span className="promo-emoji">🛍️</span>
            <span className="promo-emoji">🎁</span>
            <span className="promo-emoji">💝</span>
          </div>
        </div>
      </div>

      {/* Hot Deals Section */}
      {hotDealsProducts.length > 0 && (
        <div className="hot-deals-section">
          <div className="hot-deals-header">
            <h2>🔥 Hot Deals 🔥</h2>
            <p className="section-subtitle">Limited time offers on trending products!</p>
          </div>
          <div className="horizontal-scroll-container">
            {showLeftScroll && (
              <button className="scroll-btn scroll-left" onClick={scrollLeft}>‹</button>
            )}
            <div 
              className="hot-deals-horizontal" 
              ref={scrollContainerRef}
              onScroll={checkScrollButtons}
            >
              {hotDealsProducts.map(product => (
                <div key={product.id} className="hot-deal-horizontal-card">
                  <div className="hot-deal-badge">
                    <span className="discount-tag">-20%</span>
                    <span className="hot-tag">HOT</span>
                  </div>
                  <img 
                    src={product.image_url || 'https://via.placeholder.com/280x180'} 
                    alt={product.name}
                  />
                  <div className="hot-deal-info">
                    <h3>{product.name}</h3>
                    <p className="category">{product.category}</p>
                    <div className="price-section">
                      <span className="current-price">${product.price}</span>
                      <span className="old-price">${(product.price * 1.3).toFixed(2)}</span>
                    </div>
                    <div className="hot-deal-buttons">
                      <button onClick={() => handleAddToCart(product)}>
                        🛒 Add
                      </button>
                      <button onClick={() => {
                        handleAddToCart(product);
                        window.location.href = '/cart';
                      }}>
                        ⚡ Buy
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {showRightScroll && (
              <button className="scroll-btn scroll-right" onClick={scrollRight}>›</button>
            )}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="filter-bar">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="🔍 Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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

      {/* Products Grid */}
      <div className="products-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.image_url || 'https://via.placeholder.com/300'} alt={product.name} />
            <div className="product-info">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <div className="price">${product.price}</div>
              <button onClick={() => handleAddToCart(product)}>
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;