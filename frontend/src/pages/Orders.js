import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

function Orders({ user, API_URL }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

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

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }
    
    setCancellingId(orderId);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/orders/${orderId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order cancelled successfully!');
      fetchOrders(); // Refresh orders list
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to cancel order';
      toast.error(errorMsg);
      console.error('Error cancelling order:', error);
    } finally {
      setCancellingId(null);
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

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'pending': return 'status-pending';
      case 'paid': return 'status-paid';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const canCancel = (status) => {
    return status === 'pending';
  };

  return (
    <div className="orders-container">
      <h2>My Orders</h2>
      {orders.map(order => (
        <div key={order.id} className="order-card">
          <div className="order-header">
            <div>
              <strong>Order #{order.id}</strong>
              <span className={`order-status ${getStatusBadgeClass(order.status)}`}>
                {order.status.toUpperCase()}
              </span>
            </div>
            <div className="order-date">
              {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
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
          
          {canCancel(order.status) && (
            <div className="order-actions">
              <button 
                className="cancel-order-btn" 
                onClick={() => cancelOrder(order.id)}
                disabled={cancellingId === order.id}
              >
                {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          )}
          
          {order.status === 'cancelled' && (
            <div className="order-cancelled-note">
              <span>⚠️ This order has been cancelled</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Orders;