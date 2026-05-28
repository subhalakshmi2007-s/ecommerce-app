import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function AdBanner({ products }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAdmin, setShowAdmin] = useState(false);
  const [newAd, setNewAd] = useState({
    title: '',
    description: '',
    bgColor: '#667eea'
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [customAds, setCustomAds] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load custom ads from localStorage
    const savedAds = localStorage.getItem('customAds');
    if (savedAds) {
      setCustomAds(JSON.parse(savedAds));
    }

    // Check if user is admin
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setIsAdmin(userData.role === 'admin');
    setUser(userData);
  }, []);

  // Use products for the banner
  useEffect(() => {
    if (products && products.length > 0) {
      // Take first 8 products for the banner
      setDisplayProducts(products.slice(0, 8));
    }
  }, [products]);

  const handleAddAd = () => {
    if (!newAd.title || !newAd.description) {
      toast.error('Please fill title and description');
      return;
    }

    const ad = {
      id: Date.now(),
      ...newAd,
      type: 'custom'
    };
    const updatedAds = [...customAds, ad];
    setCustomAds(updatedAds);
    localStorage.setItem('customAds', JSON.stringify(updatedAds));
    setNewAd({ title: '', description: '', bgColor: '#667eea' });
    toast.success('Ad added successfully!');
  };

  const handleDeleteAd = (id) => {
    const updatedAds = customAds.filter(ad => ad.id !== id);
    setCustomAds(updatedAds);
    localStorage.setItem('customAds', JSON.stringify(updatedAds));
    toast.success('Ad deleted!');
  };

  const handleQuickAdd = (e, product) => {
    e.preventDefault();
    if (!user || !user.id) {
      toast.error('Please login first to add items to cart!');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      return;
    }
    toast.success(`Added ${product.name} to cart!`);
    // You can also call your addToCart function here if passed as prop
  };

  // Auto scroll products
  useEffect(() => {
    if (displayProducts.length > 3) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % (displayProducts.length - 2));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [displayProducts.length]);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="product-banner-container">
      <div className="product-banner">
        <div className="banner-content">
          <h2>🔥 Hot Deals 🔥</h2>
          <p>Limited time offers on trending products!</p>
          <Link to="/products" className="banner-shop-btn">Shop All →</Link>
        </div>
        
        <div className="banner-products-carousel">
          <div 
            className="carousel-track"
            style={{ transform: `translateX(-${currentIndex * 33.33}%)` }}
          >
            {displayProducts.map((product, idx) => (
              <div key={idx} className="banner-product-card">
                <Link to={`/product/${product.id}`}>
                  <img src={product.image_url} alt={product.name} />
                  <div className="banner-product-info">
                    <h4>{product.name}</h4>
                    <div className="price-badge">
                      <span className="banner-price">${product.price}</span>
                      <span className="discount-badge">-{Math.floor(Math.random() * 30 + 10)}%</span>
                    </div>
                    <button 
                      className="quick-add-btn" 
                      onClick={(e) => handleQuickAdd(e, product)}
                    >
                      {!user ? '🔒 Login' : 'Quick Add'}
                    </button>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Controls */}
      {isAdmin && (
        <div className="banner-admin-panel">
          <button onClick={() => setShowAdmin(!showAdmin)} className="admin-banner-toggle">
            {showAdmin ? '✕ Close Banner Manager' : '📢 Manage Banner Ads'}
          </button>
          
          {showAdmin && (
            <div className="banner-admin-form">
              <h3>Custom Text Ads</h3>
              <div className="add-custom-ad">
                <input
                  type="text"
                  placeholder="Ad Title (e.g., Summer Sale!)"
                  value={newAd.title}
                  onChange={(e) => setNewAd({...newAd, title: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newAd.description}
                  onChange={(e) => setNewAd({...newAd, description: e.target.value})}
                />
                <select
                  value={newAd.bgColor}
                  onChange={(e) => setNewAd({...newAd, bgColor: e.target.value})}
                >
                  <option value="#667eea">Purple Blue</option>
                  <option value="#ff6b6b">Red</option>
                  <option value="#4ecdc4">Teal</option>
                  <option value="#45b7d1">Blue</option>
                  <option value="#96ceb4">Green</option>
                </select>
                <button onClick={handleAddAd}>Add Text Ad</button>
              </div>

              {customAds.length > 0 && (
                <div className="custom-ads-list">
                  <h4>Your Custom Ads</h4>
                  {customAds.map(ad => (
                    <div key={ad.id} className="custom-ad-item">
                      <div>
                        <strong>{ad.title}</strong>
                        <p>{ad.description}</p>
                      </div>
                      <button onClick={() => handleDeleteAd(ad.id)}>Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdBanner;