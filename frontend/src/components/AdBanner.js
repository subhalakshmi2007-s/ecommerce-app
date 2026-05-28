import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

function AdBanner() {
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [showAdmin, setShowAdmin] = useState(false);
  const [newAd, setNewAd] = useState({
    title: '',
    description: '',
    image: '',
    link: '',
    bgColor: '#667eea'
  });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Load ads from localStorage
    const savedAds = localStorage.getItem('ads');
    if (savedAds) {
      setAds(JSON.parse(savedAds));
    } else {
      // Default ads
      const defaultAds = [
        {
          id: 1,
          title: 'Summer Sale!',
          description: 'Get up to 50% off on selected items',
          image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800',
          link: '/products',
          bgColor: '#ff6b6b'
        },
        {
          id: 2,
          title: 'New Arrivals',
          description: 'Check out our latest collection',
          image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
          link: '/products',
          bgColor: '#4ecdc4'
        },
        {
          id: 3,
          title: 'Free Shipping',
          description: 'On orders over $50',
          image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800',
          link: '/cart',
          bgColor: '#45b7d1'
        }
      ];
      setAds(defaultAds);
      localStorage.setItem('ads', JSON.stringify(defaultAds));
    }

    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setIsAdmin(user.role === 'admin');
  }, []);

  // Auto-rotate ads every 5 seconds
  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [ads.length]);

  const handleAddAd = () => {
    if (!newAd.title || !newAd.description) {
      toast.error('Please fill title and description');
      return;
    }

    const ad = {
      id: Date.now(),
      ...newAd,
      image: newAd.image || 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800'
    };
    const updatedAds = [...ads, ad];
    setAds(updatedAds);
    localStorage.setItem('ads', JSON.stringify(updatedAds));
    setNewAd({ title: '', description: '', image: '', link: '', bgColor: '#667eea' });
    toast.success('Ad added successfully!');
  };

  const handleDeleteAd = (id) => {
    const updatedAds = ads.filter(ad => ad.id !== id);
    setAds(updatedAds);
    localStorage.setItem('ads', JSON.stringify(updatedAds));
    if (currentAdIndex >= updatedAds.length) {
      setCurrentAdIndex(0);
    }
    toast.success('Ad deleted!');
  };

  const currentAd = ads[currentAdIndex];

  if (!currentAd) return null;

  return (
    <div className="ad-banner-container">
      <div 
        className="ad-banner"
        style={{ background: `linear-gradient(135deg, ${currentAd.bgColor}, ${currentAd.bgColor}dd)` }}
      >
        <div className="ad-content">
          <h2>{currentAd.title}</h2>
          <p>{currentAd.description}</p>
          <button onClick={() => window.location.href = currentAd.link}>
            Shop Now →
          </button>
        </div>
        <div className="ad-image">
          <img src={currentAd.image} alt={currentAd.title} />
        </div>
      </div>

      {/* Ad Indicators */}
      {ads.length > 1 && (
        <div className="ad-indicators">
          {ads.map((_, idx) => (
            <button
              key={idx}
              className={`ad-dot ${idx === currentAdIndex ? 'active' : ''}`}
              onClick={() => setCurrentAdIndex(idx)}
            />
          ))}
        </div>
      )}

      {/* Admin Controls - Only visible to admin */}
      {isAdmin && (
        <div className="ad-admin-panel">
          <button onClick={() => setShowAdmin(!showAdmin)} className="admin-ad-toggle">
            {showAdmin ? '✕ Close Ad Manager' : '📢 Manage Ads'}
          </button>
          
          {showAdmin && (
            <div className="ad-admin-form">
              <h3>Manage Advertisements</h3>
              
              {/* Add New Ad */}
              <div className="add-ad-form">
                <h4>Add New Ad</h4>
                <input
                  type="text"
                  placeholder="Ad Title"
                  value={newAd.title}
                  onChange={(e) => setNewAd({...newAd, title: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newAd.description}
                  onChange={(e) => setNewAd({...newAd, description: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Image URL (optional)"
                  value={newAd.image}
                  onChange={(e) => setNewAd({...newAd, image: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Link URL (e.g., /products)"
                  value={newAd.link}
                  onChange={(e) => setNewAd({...newAd, link: e.target.value})}
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
                  <option value="#feca57">Yellow</option>
                  <option value="#ff9ff3">Pink</option>
                </select>
                <button onClick={handleAddAd}>Add Ad</button>
              </div>

              {/* Existing Ads List */}
              <div className="ads-list">
                <h4>Existing Ads</h4>
                {ads.map(ad => (
                  <div key={ad.id} className="ad-item">
                    <div>
                      <strong>{ad.title}</strong>
                      <p>{ad.description}</p>
                    </div>
                    <button onClick={() => handleDeleteAd(ad.id)}>Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdBanner;