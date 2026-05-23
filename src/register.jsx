import React, { useState } from 'react';
import TermsOfService from './TermsOfService';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', 
        body: JSON.stringify({ email, username, password }), 
      });

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('authorName', data.username);
          window.location.href = '/authorAccountPage'; // temporarily bypassing /pledge 
        } else {
          setError(data.msg || 'Registration failed');
        }
      } else {
        setError(`Server Error: ${res.status}. Verify the backend route.`);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred while creating the account.');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '2px solid #C19A6B',
    backgroundColor: '#1B1411',
    color: '#F5EFE0',
    fontSize: '16px',
    fontFamily: "'Courier New', Courier, monospace"
  };

  const labelStyle = {
    fontSize: '16px',
    display: 'block',
    marginBottom: '5px',
    color: '#C19A6B',
    fontFamily: "'Courier New', Courier, monospace"
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <div className="login-container" style={{ 
        backgroundColor: '#2D1E17', 
        padding: '30px', 
        borderRadius: '10px', 
        border: '2px solid #C19A6B', 
        width: '100%',
        maxWidth: '450px', 
        margin: '50px 20px', 
        textAlign: 'center',
        fontFamily: "'Courier New', Courier, monospace"
      }}>
      <h2 style={{ color: '#C19A6B', marginBottom: '20px' }}>Register</h2>
      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
          <label style={labelStyle}>
            Username <span style={{ fontSize: '0.8rem', color: '#8a7b70', fontWeight: 'normal' }}>(the name that's tied to your stories. your pen name or author name)</span>
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="e.g. GreyhoundWriter76"
            style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        
        <TermsOfService />
        
        <div style={{ marginBottom: '20px', textAlign: 'left', color: '#F5EFE0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input 
            type="checkbox" 
            id="tos-agree"
            required 
            checked={agreed} 
            onChange={(e) => setAgreed(e.target.checked)}
            style={{ cursor: 'pointer', accentColor: '#C19A6B' }}
          />
          <label htmlFor="tos-agree" style={{ cursor: 'pointer' }}>I agree to the Terms of Service</label>
        </div>

        {error && <p style={{color: '#cc5555', marginTop: '10px', fontSize: '0.8rem'}}>{error}</p>}
        <button type="submit" style={{ 
          width: '100%', 
          padding: '12px', 
          backgroundColor: '#C19A6B', 
          color: '#1B1411', 
          border: 'none', 
          borderRadius: '5px', 
          fontSize: '18px', 
          cursor: 'pointer', 
          fontWeight: 'bold',
          fontFamily: "'Courier New', Courier, monospace"
        }}>
          Create Account
        </button>
      </form>
      </div>
    </div>
  );
};

export default Register;