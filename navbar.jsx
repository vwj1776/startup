// NavBar.jsx
import React from "react";

const NavBar = () => {
  return (
    <nav style={{ padding: "10px", background: "#333", color: "white" }}>
      <a href="loginPage.html" style={{ marginRight: "10px", color: "white" }}>Login</a>
      <a href="authorAccount.html" style={{ marginRight: "10px", color: "white" }}>Account Info</a>

      <a href="manyStories.html" style={{ marginRight: "10px", color: "white" }}>About</a>
      <a href="demo.html" style={{ color: "white" }}>demo page turn</a>
    </nav>
  );
};

export default NavBar;
