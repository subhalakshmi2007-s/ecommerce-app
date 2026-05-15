import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Admin({ API_URL }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: '', stock: '', image_url: '' });

  const token = localStorage.getItem('token');

  const fetchData = async () => {
    try {
      const [productsRes, ordersRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/products`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/admin/orders`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await axios.put(`${API_URL}/api/admin/products/${editingProduct.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/api/admin/products`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchData();
      setShowModal(false);
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', category: '', stock: '', image_url: '' });
    } catch (err) {
      alert('Error saving product');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      await axios.delete(`${API_URL}/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    }
  };

  const handleStatusUpdate = async (id, status) => {
    await axios.put(`${API_URL}/api/admin/orders/${id}/status`, { status }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchData();
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div className="tabs">
        <button className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
        <button className={`tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>Products</button>
        <button className={`tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Orders</button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="stats-grid">
          <div className="stat-card"><h3>Products</h3><div className="stat-value">{stats.products || 0}</div></div>
          <div className="stat-card"><h3>Orders</h3><div className="stat-value">{stats.orders || 0}</div></div>
          <div className="stat-card"><h3>Users</h3><div className="stat-value">{stats.users || 0}</div></div>
          <div className="stat-card"><h3>Revenue</h3><div className="stat-value">${(stats.revenue || 0).toFixed(2)}</div></div>
        </div>
      )}

      {activeTab === 'products' && (
        <div>
          <button onClick={() => setShowModal(true)}>Add Product</button>
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Name</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td><td>{p.name}</td><td>${p.price}</td><td>{p.stock}</td>
                  <td><button onClick={() => { setEditingProduct(p); setFormData(p); setShowModal(true); }}>Edit</button>
                  <button onClick={() => handleDelete(p.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'orders' && (
        <table className="admin-table">
          <thead><tr><th>ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Address</th><th>Action</th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td>{o.id}</td><td>{o.user_name}</td><td>${o.total}</td><td>{o.status}</td><td>{o.address}</td>
                <td><select onChange={(e) => handleStatusUpdate(o.id, e.target.value)} value={o.status}>
                  <option value="pending">Pending</option><option value="paid">Paid</option>
                  <option value="shipped">Shipped</option><option value="delivered">Delivered</option>
                </select></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
              <input type="number" placeholder="Price" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
              <input type="text" placeholder="Category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required />
              <input type="number" placeholder="Stock" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} required />
              <input type="text" placeholder="Image URL" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} />
              <button type="submit">Save</button>
              <button type="button" onClick={() => { setShowModal(false); setEditingProduct(null); }}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;