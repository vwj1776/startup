import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Demo } from './demo/demo';
import { Login } from './login/login';
import { authorAccount } from './authorAccount/authorAccount';
import { manyStories } from './manyStories/manyStories';



export default function App() {
  return (
    <BrowserRouter>
    <div className="body bg-dark text-light">
      <header className="container-fluid">
        <nav className="navbar fixed-top navbar-dark">
          <div className="navbar-brand">
            Greyhound Writing<sup>&reg;</sup>
          </div>
          <menu className="navbar-nav">
            <li className="nav-item">
              <NavLink className="nav-link" href="demo.html">
                Demo
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" href="index.html">
                Login
              </NavLink>
            </li> 
            <li className="nav-item">
              <NavLink className="nav-link" href="1ststory.html">
                1st Story
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" href="authorAccount.html">
                Author Account
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" href="manyStories.html">
                Many Stories
              </NavLink>
            </li>
          </menu>
        </nav>
      </header>

      <Routes>
  <Route path='/demo' element={<Demo />} exact />
  <Route path='/login' element={<Login />} />
  <Route path='/authorAccount' element={<authorAccount />} />
  <Route path='/manyStories' element={<manyStories />} />
  <Route path='*' element={<NotFound />} />
      </Routes>

      function NotFound() {
  return <main className="container-fluid bg-secondary text-center">404: Return to sender. Address unknown.</main>;
}

      <footer className="bg-dark text-white-50">
        <div className="container-fluid">
          <span className="text-reset">Author Name(s)</span>
          <a className="text-reset" href="https://github.com/webprogramming260/simon-react">
            Source
          </a>
        </div>
      </footer>
    </div>
    </BrowserRouter>
  );
}