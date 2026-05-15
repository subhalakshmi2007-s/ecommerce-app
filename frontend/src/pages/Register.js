import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register({ setUser, API_URL }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Validation
    if (!name || !email || !password) {
      setError('All fields are required');
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting to register:', { name, email });
      
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        name,
        email,
        password
      });
      
      console.log('Registration successful:', response.data);
      
      // Save token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Update parent component state
      setUser(response.data.user);
      
      // Redirect to home page
      navigate('/');
      
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response);
      
      if (err.response) {
        // Server responded with error
        setError(err.response.data?.error || 'Registration failed. Please try again.');
      } else if (err.request) {
        // Request was made but no response
        setError('Cannot connect to server. Make sure backend is running on port 5000');
      } else {
        // Something else happened
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Register</h2>
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
          <label>Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            disabled={loading}
          />
        </div>
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
          <label>Password (min 6 characters)</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            disabled={loading}
            minLength="6"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}

export default Register;