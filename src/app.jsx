import React from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import Demo from './demo/demo';
import Login from './login/login';
import AuthorAccount from './authorAccount/authorAccount';
import ManyStories from './manyStories/manyStories';
import FirstStory from './1ststory/1ststory';
import Register from './register';
import './app.css';
import logo from '../public/writing_logo.png';

function NavBar({ authorEmail, onLogout }) {
  return (
    <nav>
      <img src={logo} alt="logo" />
      <div>Greyhound Writing</div>
      <menu>
        {authorEmail ? (
          <>
            <li><NavLink to="/authorAccount" className="highlighted-link">Author Account</NavLink></li>
            <li><NavLink to="/manyStories" className="highlighted-link">Many Stories</NavLink></li>
            <li><NavLink to="/demo" className="highlighted-link">Demo</NavLink></li>
            <li>
              <button className="highlighted-link" onClick={onLogout}>Logout</button>
            </li>
          </>
        ) : (
          <>
            <li><NavLink to="/" className="highlighted-link">Login</NavLink></li>
            <li><NavLink to="/register" className="highlighted-link">Register</NavLink></li>
          </>
        )}
        <li>
          <a className="highlighted-link" href="https://github.com/vwj1776/startup.git" target="_blank" rel="noopener noreferrer">
            NotTheRepository
          </a>
        </li>
        <li>
          <a className="highlighted-link" href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer">
            Repository
          </a>
        </li>
      </menu>
    </nav>
  );
}

function NotFound() {
  return <main>404: Return to sender. Address unknown.</main>;
}

function AppRouterWrapper() {
  const navigate = useNavigate();
  const authorEmail = localStorage.getItem('authorEmail');

  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'DELETE',
      credentials: 'include',
    });
    localStorage.removeItem('authorEmail');
    navigate('/');
  };

  return (
    <div>
      <header>
        <NavBar authorEmail={authorEmail} onLogout={handleLogout} />
      </header>

      <Routes>
        {authorEmail ? (
          <>
            <Route path="/authorAccount" element={<AuthorAccount />} />
            <Route path="/manyStories" element={<ManyStories />} />
            <Route path="/story/:id" element={<FirstStory />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="*" element={<NotFound />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Login />} />
          </>
        )}
      </Routes>

      <footer className="footer">
        <div>
          <span>{authorEmail}</span>
          <a href="https://github.com/webprogramming260/simon-react">Source</a>
        </div>
      </footer>
    </div>
  );
}

export default AppRouterWrapper;
