import React, { useState } from 'react';
import axios from 'axios';

function Cart({ cart, updateQuantity, removeFromCart, user, clearCart, API_URL }) {
  const [address, setAddress] = useState('');
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const placeOrder = async () => {
    if (!user) {
      alert('Please login first');
      return;
    }
    if (!address) {
      alert('Please enter address');
      return;
    }

    const items = cart.map(item => ({ productId: item.id, quantity: item.quantity }));
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/orders`, { items, address }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      clearCart();
      setAddress('');
      alert('Order placed successfully!');
    } catch (err) {
      alert('Error placing order');
    }
  };

  if (cart.length === 0) {
    return <h2>Cart is empty</h2>;
  }

  return (
    <div>
      <h2>Shopping Cart</h2>
      {cart.map(item => (
        <div key={item.id} className="cart-item">
          <div>
            <h3>{item.name}</h3>
            <p>${item.price}</p>
          </div>
          <div>
            <input type="number" value={item.quantity} onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))} min="1" />
            <button onClick={() => removeFromCart(item.id)}>Remove</button>
          </div>
        </div>
      ))}
      <div className="cart-total">
        <h3>Total: ${total.toFixed(2)}</h3>
        <textarea rows="3" placeholder="Delivery Address" value={address} onChange={(e) => setAddress(e.target.value)}></textarea>
        <button onClick={placeOrder}>Place Order</button>
      </div>
    </div>
  );
}

export default Cart;