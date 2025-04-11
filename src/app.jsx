import React from 'react';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import Demo from './demo/demo';
import Login from './login/login';
import AuthorAccount from './authorAccount/authorAccount';
import ManyStories from './manyStories/manyStories';
import FirstStory from './1ststory/1ststory';
import './app.css';
import logo from '../public/writing_logo.png'; // Adjust the path as necessary

export default function App() {
  function NotFound() {
    return <main>404: Return to sender. Address unknown.</main>;
  }

  return (
    <BrowserRouter>
      <div>
        <header>
          <nav>
            <img src={logo} alt="logo" />
            <div>Greyhound Writing</div>
            <menu>
              <li>
                <NavLink to="/demo" className="highlighted-link">Demo</NavLink>
              </li>
              <li>
                <NavLink to="/" className="highlighted-link">Login</NavLink>
              </li> 
              <li>
                <NavLink to="/FirstStory" className="highlighted-link">1st Story</NavLink>
              </li>
              <li>
                <NavLink to="/authorAccount" className="highlighted-link">Author Account</NavLink>
              </li>
              <li>
                <NavLink to="/manyStories" className="highlighted-link">Many Stories</NavLink>
              </li>
              <li>
                {/* Use <a> instead of <NavLink> for external links */}
                <a className="highlighted-link" href="https://github.com/vwj1776/startup.git" target="_blank" rel="noopener noreferrer">
                  Repository
                </a>
              </li>
              <li>
                <a className="highlighted-link" href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer">
                  Repository
                </a>
              </li>
            </menu>
          </nav>
        </header>

        <Routes>
          <Route path="/demo" element={<Demo />} />
          <Route path="/authorAccount" element={<AuthorAccount />} />
          <Route path="/manyStories" element={<ManyStories />} />
          <Route path="/FirstStory" element={<FirstStory />} />
          <Route path="/" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <footer className="footer">
          <div>
            <span>Author Name(s)</span>
            <a href="https://github.com/webprogramming260/simon-react">Source</a>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
