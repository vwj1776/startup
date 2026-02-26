import React, { useState } from 'react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');

    try {
      // Changed /api/auth/create to /api/auth/register to match index.js
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify({ email, username, password }), 
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('authorName', data.username);
        window.location.href = '/pledge'; 
      } else {
        // This will now catch the "Email already exists" message from the server
        setError(data.msg || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred while creating the account.');
    }
  };

  return (
    <div className="login-container">
      <h2>Register</h2>
      <form id="registerForm" onSubmit={handleRegister}>
        <div className="input-group">
          <label htmlFor="username">Username (Publicly Displayed)</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="e.g. GreyhoundWriter76"
          />
        </div>
        <div className="input-group">
          <label htmlFor="email">Email (Private)</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
          />
        </div>
        {error && <p className="error-msg" style={{color: '#ff4444', marginTop: '10px'}}>{error}</p>}
        <button type="submit">Create Account</button>
      </form>
    </div>
  );
};

export default Register;