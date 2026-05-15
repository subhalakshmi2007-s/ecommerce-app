import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ user, logout, cartCount, darkMode, toggleDarkMode }) {
  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">🛍️ Flip Shop</Link>
      </div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/cart">🛒 Cart {cartCount > 0 && <span className="cart-count">{cartCount}</span>}</Link>
        {user ? (
          <>
            <span>👋 {user.name}</span>
            {user.role === 'admin' && <Link to="/admin">⚙️ Admin</Link>}
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
        <button onClick={toggleDarkMode} className="dark-mode-toggle">
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;