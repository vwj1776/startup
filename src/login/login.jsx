import React, { useState } from 'react';
import './index.css';

const Login = () => {
  const [username, setUsername] = useState(localStorage.getItem('authorName') || '');

  const handleLogin = (event) => {
    event.preventDefault();
    localStorage.setItem('authorName', username);
    // window.location.href = 'authorAccount.html';
  };

  return (
    <div>
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
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" required />
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;