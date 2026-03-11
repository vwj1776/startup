import React, { useEffect, useState } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import Login from './login/login';
import AuthorAccountPage from './authorAccountPage/authorAccountPage';
import StoryCollection from './storyCollection/storyCollection';
import FirstStory from './1ststory/1ststory';
import Register from './register';
import WritingEditor from './editor/WritingEditor';
import AdminPage from './adminPage/adminPage'; 
import Curriculum from './curriculum/curriculum'; 
import Pledge from './pledge/pledge'; // ADDED IMPORT
import AuthorInfo from './authorInfo/authorInfo';
import './app.css';

function NavBar({ authorEmail, onLogout }) {
  return (
    <nav>
      <menu>
        {authorEmail ? (
          <>
            <NavLink to="/authorAccountPage" className="highlighted-link">Account</NavLink>
            <NavLink to="/curriculum" className="highlighted-link">Curriculum</NavLink>
            <NavLink to="/write" className="highlighted-link">Write</NavLink>
            <NavLink to="/storyCollection" className="highlighted-link">Collection</NavLink>
            <NavLink className="highlighted-link" onClick={onLogout} style={{cursor: 'pointer'}}>Logout</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/" className="highlighted-link">Login</NavLink>
            <NavLink to="/register" className="highlighted-link">Register</NavLink>
          </>
        )}
      </menu>
    </nav>
  );
}

export default function AppRouterWrapper() {
  const navigate = useNavigate();
  const [authorEmail, setAuthorEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch(`/api/user/me?t=${Date.now()}`, { credentials: 'include' });
        
        if (res.ok) {
          const data = await res.json();
          setAuthorEmail(data.email);
          localStorage.setItem('authorEmail', data.email);
        } else {
          localStorage.clear();
          setAuthorEmail(null);
        }
      } catch (err) {
        setAuthorEmail(null);
      } finally {
        setIsLoading(false);
      }
    };
    verifySession();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    localStorage.clear();
    setAuthorEmail(null); 
    navigate('/');
  };

  if (isLoading) {
    return (
      <div style={{
        color: '#C19A6B', 
        padding: '50px', 
        textAlign: 'center', 
        fontSize: '1.2rem', 
        fontFamily: "'Courier New', Courier, monospace"
      }}>
        Loading Greyhound...
      </div>
    );
  }

  return (
    <div id="bodyApp" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
      <header><NavBar authorEmail={authorEmail} onLogout={handleLogout} /></header>
      <main>
        <Routes>
          {/* FIX: Put the Pledge route here so it's accessible 
             immediately after registration, even if state is still updating. 
          */}
          <Route path="/pledge" element={<Pledge />} />

          {authorEmail ? (
            <>
              <Route path="/authorAccountPage" element={<AuthorAccountPage key="account" />} />
              <Route path="/curriculum" element={<Curriculum />} />
              <Route path="/authorInfo" element={<AuthorInfo />} />
              <Route path="/write" element={<WritingEditor />} />
              <Route path="/write/:storyId" element={<WritingEditor />} />
              <Route path='/admin' element={<AdminPage />} />
              <Route path="/storyCollection" element={<StoryCollection />} />
              <Route path="/story/:id" element={<FirstStory />} />
              <Route path="*" element={<StoryCollection />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Login />} />
            </>
          )}
        </Routes>
      </main>
      <footer className="footer">
        <div>
          <span>Logged in as: {authorEmail || 'Guest'}</span>
          {authorEmail && (
            <span 
              onClick={handleLogout} 
              style={{
                marginLeft: '10px', 
                textDecoration: 'underline', 
                cursor: 'pointer', 
                fontSize: '0.8rem', 
                color: '#cc5555'
              }}
            >
              (Not you?)
            </span>
          )}
        </div>
      </footer>
    </div>
  );
}