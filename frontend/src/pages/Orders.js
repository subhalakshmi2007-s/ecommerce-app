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
      console.log('Fetching orders...');
      const response = await axios.get(`${API_URL}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Orders received:', response.data);
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }
    
    setCancellingId(orderId);
    console.log(`Cancelling order #${orderId}...`);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/api/orders/${orderId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Cancel response:', response.data);
      toast.success('Order cancelled successfully!');
      fetchOrders(); // Refresh orders list
      
    } catch (error) {
      console.error('Error cancelling order:', error);
      const errorMsg = error.response?.data?.error || 'Failed to cancel order';
      toast.error(errorMsg);
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

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return '⏳ Pending';
      case 'paid': return '✅ Paid';
      case 'shipped': return '📦 Shipped';
      case 'delivered': return '🏠 Delivered';
      case 'cancelled': return '❌ Cancelled';
      default: return status;
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
                {getStatusText(order.status)}
              </span>
            </div>
            <div className="order-date">
              {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
            </div>
          </div>
          
          <div className="order-items">
            <strong>Items:</strong>
            {order.items && order.items.map((item, idx) => (
              <div key={idx} className="order-item">
                <span>{item.name}</span>
                <span>Quantity: {item.quantity}</span>
                <span>${item.price} each</span>
                <span>Total: ${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <div className="order-details">
            <div className="order-address">
              <strong>Delivery Address:</strong>
              <p>{order.address}</p>
            </div>
            <div className="order-total">
              <strong>Total Amount:</strong>
              <h3>${order.total.toFixed(2)}</h3>
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