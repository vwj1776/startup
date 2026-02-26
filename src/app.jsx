import React, { useEffect } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import Demo from './demo/demo';
import Login from './login/login';
import AuthorAccountPage from './authorAccountPage/authorAccountPage';
import StoryCollection from './storyCollection/storyCollection';
import FirstStory from './1ststory/1ststory';
import Register from './register';
import Pledge from './pledge/pledge';
import Curriculum from './curriculum/curriculum';
import WritingEditor from './editor/WritingEditor';
import AdminPage from './adminPage/adminPage'; 

import './app.css';

function NavBar({ authorEmail, onLogout }) {
  return (
    <nav>
      <menu>
        {authorEmail ? (
          <>
            <NavLink to="/authorAccountPage" className="highlighted-link">Account</NavLink>
            <NavLink to="/write" className="highlighted-link">Write</NavLink>
            <NavLink to="/storyCollection" className="highlighted-link">Story Collection</NavLink>
            <NavLink className="highlighted-link" onClick={onLogout} style={{cursor: 'pointer'}}>Logout</NavLink>
            <NavLink to="/curriculum" className="highlighted-link">Curriculum</NavLink>
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
  const [authorEmail, setAuthorEmail] = React.useState(localStorage.getItem('authorEmail'));

  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch('/api/user/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setAuthorEmail(data.email);
          localStorage.setItem('authorEmail', data.email);
        } else {
          localStorage.removeItem('authorEmail');
          localStorage.removeItem('authorName');
          setAuthorEmail(null);
        }
      } catch (err) {
        console.error("Auth sync failed", err);
      }
    };
    verifySession();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error("Logout failed");
    }
    localStorage.removeItem('authorEmail');
    localStorage.removeItem('authorName');
    setAuthorEmail(null); 
    navigate('/');
  };

  return (
    <div id="bodyApp">
      <header>
        <NavBar authorEmail={authorEmail} onLogout={handleLogout} />
      </header>

      <main>
        <Routes>
          {authorEmail ? (
            <>
              <Route path="/authorAccountPage" element={<AuthorAccountPage />} />
              <Route path="/write" element={<WritingEditor />} />
              <Route path="/write/:storyId" element={<WritingEditor />} />
              <Route path="/curriculum" element={<Curriculum />} />
              <Route path='/admin' element={<AdminPage />} />
              <Route path="/storyCollection" element={<StoryCollection />} />
              <Route path="/genre/:genreName" element={<StoryCollection />} />
              <Route path="/story/:id" element={<FirstStory />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/pledge" element={<Pledge />} />
              {/* If no match found above, it goes here */}
              <Route path="*" element={<StoryCollection />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/pledge" element={<Pledge />} />
              <Route path="*" element={<Login />} />
            </>
          )}
        </Routes>
      </main>

      <footer className="footer">
        <div>
          <span>Logged in as: {authorEmail || 'Guest'}</span>
          <br />
          <a href="https://github.com/webprogramming260/simon-react">Source</a>
        </div>
      </footer>
    </div>
  );
}