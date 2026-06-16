import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

function Login({ setUser, API_URL }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login for:', email);
      console.log('API_URL:', API_URL);
      
      const response = await axios.post(`${API_URL}/api/auth/login`, { 
        email, 
        password 
      });
      
      console.log('Login successful:', response.data);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      
      toast.success('Login successful!');
      navigate('/');
      
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response);
      
      if (err.response) {
        setError(err.response.data?.error || 'Invalid email or password');
      } else if (err.request) {
        setError('Cannot connect to server. Make sure backend is running on port 5000');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      {error && (
        <div style={{ 
          color: 'red', 
          marginBottom: '10px', 
          padding: '10px', 
          background: '#ffeeee',
          borderRadius: '5px',
          border: '1px solid red'
        }}>
          ❌ {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default Login;