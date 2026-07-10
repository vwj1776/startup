import React, { useState } from 'react';
import './login.css';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identifier, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('authorEmail', data.email);
        window.location.href = '/authorAccountPage'; 
      } else {
        const err = await res.json();
        setError(err.msg || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Check backend status.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required placeholder="Username or Email" />
        </div>
        <div className="input-group">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Password" />
        </div>
        {error && <p className="error-msg">{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;