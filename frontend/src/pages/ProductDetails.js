import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProductDetails({ addToCart, API_URL }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products/${id}`);
      setProduct(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    addToCart(product);
    navigate('/cart');
  };

  if (loading) return <div className="loading">Loading product details...</div>;
  if (!product) return <div className="loading">Product not found</div>;

  return (
    <div className="product-details-container">
      <button className="back-btn" onClick={() => navigate('/')}>← Back to Products</button>
      
      <div className="product-details">
        <div className="product-image-section">
          <img src={product.image_url} alt={product.name} />
          {product.stock < 10 && <span className="stock-warning">🔥 Only {product.stock} left!</span>}
        </div>
        
        <div className="product-info-section">
          <h1>{product.name}</h1>
          <p className="category">📁 {product.category}</p>
          <div className="rating">
            {'⭐'.repeat(Math.floor(product.rating || 4))} {product.rating}
          </div>
          
          <div className="price-section">
            <span className="current-price">${product.price}</span>
            {product.old_price && <span className="old-price">${product.old_price}</span>}
          </div>
          
          <div className="stock-info">
            <span className={product.stock > 0 ? 'in-stock' : 'out-of-stock'}>
              {product.stock > 0 ? `✅ In Stock (${product.stock} items available)` : '❌ Out of Stock'}
            </span>
          </div>
          
          <div className="quantity-selector">
            <label>Quantity:</label>
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
          </div>
          
          <div className="action-buttons">
            <button className="add-to-cart-btn" onClick={handleAddToCart}>🛒 Add to Cart</button>
            <button className="buy-now-btn" onClick={handleBuyNow}>⚡ Buy Now</button>
          </div>
          
          <div className="delivery-info">
            <p>🚚 Free delivery on orders over $50</p>
            <p>🔄 30-day easy returns</p>
            <p>💳 Secure payment</p>
          </div>
        </div>
      </div>
      
      <div className="product-tabs">
        <div className="tabs-header">
          <button className={activeTab === 'description' ? 'active' : ''} onClick={() => setActiveTab('description')}>
            Description
          </button>
          <button className={activeTab === 'specifications' ? 'active' : ''} onClick={() => setActiveTab('specifications')}>
            Specifications
          </button>
          <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>
            Reviews
          </button>
        </div>
        
        <div className="tabs-content">
          {activeTab === 'description' && (
            <div className="description-content">
              <h3>Product Description</h3>
              <p>{product.description}</p>
            </div>
          )}
          
          {activeTab === 'specifications' && (
            <div className="specifications-content">
              <h3>Technical Specifications</h3>
              <table className="specs-table">
                <tbody>
                  <tr><td><strong>Brand</strong></td><td>{product.brand || 'Premium Brand'}</td></tr>
                  <tr><td><strong>Model</strong></td><td>{product.name}</td></tr>
                  <tr><td><strong>Category</strong></td><td>{product.category}</td></tr>
                  <tr><td><strong>Price</strong></td><td>${product.price}</td></tr>
                  <tr><td><strong>Stock Status</strong></td><td>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</td></tr>
                  <tr><td><strong>Rating</strong></td><td>{product.rating} / 5</td></tr>
                  <tr><td><strong>Warranty</strong></td><td>1 Year Manufacturer Warranty</td></tr>
                </tbody>
              </table>
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div className="reviews-content">
              <h3>Customer Reviews</h3>
              <div className="review">
                <div className="review-rating">⭐⭐⭐⭐⭐</div>
                <p>Excellent product! Very satisfied with the quality.</p>
                <small>- Verified Buyer</small>
              </div>
              <div className="review">
                <div className="review-rating">⭐⭐⭐⭐</div>
                <p>Good product, fast delivery.</p>
                <small>- Happy Customer</small>
              </div>
              <button className="write-review-btn">Write a Review</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;