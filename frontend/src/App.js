import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import ProductDetails from './pages/ProductDetails';
import Orders from './pages/Orders';  // ← ADD THIS LINE
import Navbar from './components/Navbar';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
      document.body.setAttribute('data-theme', 'dark');
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.setAttribute('data-theme', 'dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.body.removeAttribute('data-theme');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    let newCart;
    if (existing) {
      newCart = cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    alert('Added to cart!');
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter(item => item.id !== productId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const newCart = cart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    );
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.setItem('cart', '[]');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Navbar 
        user={user} 
        logout={logout} 
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
      <div className="container">
        <Routes>
  <Route path="/" element={<Home addToCart={addToCart} API_URL={API_URL} />} />
  <Route path="/product/:id" element={<ProductDetails addToCart={addToCart} API_URL={API_URL} />} />
  <Route path="/login" element={<Login setUser={setUser} API_URL={API_URL} />} />
  <Route path="/register" element={<Register setUser={setUser} API_URL={API_URL} />} />
  <Route path="/cart" element={<Cart cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart} user={user} clearCart={clearCart} API_URL={API_URL} />} />
  <Route path="/orders" element={<Orders user={user} API_URL={API_URL} />} />
  <Route path="/admin/*" element={user?.role === 'admin' ? <Admin API_URL={API_URL} /> : <Navigate to="/" />} />
</Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;