import React, { useState } from 'react';
import './login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState(''); // Added state for UN
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      // UPDATED: Pointing to Port 4000 explicitly to avoid the 404/HTML error
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // ⬅️ Important: sets the cookie!
        body: JSON.stringify({ email, username, password }), // Added username here
      });

      if (res.ok) {
        const data = await res.json();
        
        // Store the email and the official username from the database
        localStorage.setItem('authorEmail', data.email);
        localStorage.setItem('authorName', data.username); 
        
        window.location.href = '/authorAccountPage'; // redirect to author page
      } else {
        const err = await res.json();
        setError(err.msg || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred while logging in. Make sure the backend server is running on port 4000.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form id="loginForm" onSubmit={handleLogin}>
        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter your username"
          />
        </div>
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </div>
        {error && <p className="error-msg">{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;