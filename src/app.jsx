import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import Demo from './demo/demo';
import Login from './login/login';
import AuthorAccount from './authorAccount/authorAccount';
import ManyStories from './manyStories/manyStories';
import './app.css'; // Make sure to move styling here

export default function App() {
  function NotFound() {
    return <main className="not-found">404: Return to sender. Address unknown.</main>;
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        <header className="header">
          <nav className="navbar">
            <div className="brand">Greyhound Writing<sup>&reg;</sup></div>
            <menu className="nav-links">
              <li>
                <NavLink to="/demo">Demo</NavLink>
              </li>
              <li>
                <NavLink to="/">Login</NavLink>
              </li> 
              <li>
                <NavLink to="/1stStory">1st Story</NavLink>
              </li>
              <li>
                <NavLink to="/authorAccount">Author Account</NavLink>
              </li>
              <li>
                <NavLink to="/manyStories">Many Stories</NavLink>
              </li>
            </menu>
          </nav>
        </header>

        <Routes>
          {/* <Route path="/demo" element={<Demo />} exact /> */}
          <Route path="/authorAccount" element={<AuthorAccount />} />
          <Route path="/manyStories" element={<ManyStories />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/" element={<Login />} />
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
