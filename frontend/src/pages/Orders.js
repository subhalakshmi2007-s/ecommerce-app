import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Orders({ user, API_URL }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="orders-container">
        <h2>My Orders</h2>
        <div className="no-orders">
          <p>Please login to view your orders.</p>
          <a href="/login"><button>Login</button></a>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading your orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="orders-container">
        <h2>My Orders</h2>
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
          <a href="/"><button>Start Shopping</button></a>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h2>My Orders</h2>
      {orders.map(order => (
        <div key={order.id} className="order-card">
          <div className="order-header">
            <div>
              <strong>Order #{order.id}</strong>
              <span className={`order-status status-${order.status}`}>{order.status}</span>
            </div>
            <div className="order-date">
              {new Date(order.created_at).toLocaleDateString()}
            </div>
          </div>
          <div className="order-details">
            <div className="order-address">
              <strong>Delivery Address:</strong>
              <p>{order.address}</p>
            </div>
            <div className="order-total">
              <strong>Total Amount:</strong>
              <h3>${order.total}</h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Orders;