import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

function Cart({ cart, updateQuantity, removeFromCart, user, clearCart, API_URL }) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error('Please enter full name');
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error('Please enter phone number');
      return false;
    }
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      toast.error('Please enter valid 10-digit phone number');
      return false;
    }
    if (!formData.address.trim()) {
      toast.error('Please enter delivery address');
      return false;
    }
    if (!formData.city.trim()) {
      toast.error('Please enter city');
      return false;
    }
    if (!formData.state.trim()) {
      toast.error('Please enter state');
      return false;
    }
    if (!formData.pincode.trim()) {
      toast.error('Please enter pincode');
      return false;
    }
    if (!/^[0-9]{6}$/.test(formData.pincode)) {
      toast.error('Please enter valid 6-digit pincode');
      return false;
    }
    return true;
  };

  const placeOrder = async () => {
    if (!user) {
      toast.error('Please login first');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    const items = cart.map(item => ({ 
      productId: item.id, 
      quantity: item.quantity 
    }));
    
    const fullAddress = `${formData.address}, ${formData.landmark ? formData.landmark + ', ' : ''}${formData.city}, ${formData.state} - ${formData.pincode}`;
    
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      console.log('Placing order with items:', items);
      console.log('Address:', fullAddress);
      
      const response = await axios.post(`${API_URL}/api/orders`, { 
        items, 
        address: fullAddress,
        userId: user.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Order response:', response.data);
      
      if (response.data.message) {
        clearCart();
        setFormData({
          fullName: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          landmark: ''
        });
        toast.success('Order placed successfully!');
        setTimeout(() => {
          window.location.href = '/orders';
        }, 1500);
      } else {
        toast.error('Failed to place order');
      }
    } catch (err) {
      console.error('Error placing order:', err);
      const errorMsg = err.response?.data?.error || 'Error placing order';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your Cart is Empty</h2>
        <p>Add some products to your cart and come back!</p>
        <button onClick={() => window.location.href = '/'}>Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h2>Shopping Cart</h2>
      
      <div className="cart-layout">
        <div className="cart-items-section">
          <h3>Cart Items ({cart.length})</h3>
          {cart.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-image">
                <img 
                  src={item.image_url || 'https://via.placeholder.com/70'} 
                  alt={item.name}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/70'; }}
                />
              </div>
              <div className="cart-item-details">
                <h4>{item.name}</h4>
                <p className="cart-item-price">${item.price}</p>
                <p className="cart-item-category">{item.category || 'General'}</p>
              </div>
              <div className="cart-item-actions">
                <div className="quantity-control">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                  Remove
                </button>
              </div>
              <div className="cart-item-total">
                <p>Total: ${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
          
          <div className="cart-summary">
            <div className="cart-total">
              <h3>Subtotal: <span>${total.toFixed(2)}</span></h3>
              <p>Shipping: <span>Free</span></p>
              <hr />
              <h2>Total: <span>${total.toFixed(2)}</span></h2>
            </div>
          </div>
        </div>

        <div className="delivery-details-section">
          <h3>Delivery Details</h3>
          <form className="delivery-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input 
                  type="text" 
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input 
                  type="tel" 
                  name="phone"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  maxLength="10"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Address *</label>
              <textarea 
                name="address"
                placeholder="House number, street, area"
                rows="2"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Landmark (Optional)</label>
              <input 
                type="text" 
                name="landmark"
                placeholder="Nearby landmark"
                value={formData.landmark}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input 
                  type="text" 
                  name="city"
                  placeholder="City name"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>State *</label>
                <input 
                  type="text" 
                  name="state"
                  placeholder="State name"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Pincode *</label>
                <input 
                  type="text" 
                  name="pincode"
                  placeholder="6-digit pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  maxLength="6"
                  required
                />
              </div>
            </div>
          </form>

          <button 
            className="place-order-btn" 
            onClick={placeOrder}
            disabled={isSubmitting || cart.length === 0}
          >
            {isSubmitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;