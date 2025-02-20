import React from 'react';
// import './authorAccount.css';

export default function AuthorAccount() {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type !== "text/plain") {
      alert("Please upload a text file.");
      event.target.value = "";
    }
  };

  return (
    <div>
      <nav>
        <a href="authorAccount.html" target="_blank">
          <div>
            <p>Upload Stories here</p>
          </div>
        </a>
        <a href="demo.html" target="_blank">
          <div>
            <p>demo page turn</p>
          </div>
        </a>
        <a href="index.html" target="_blank">
          Login
        </a>
        <div id="authorIcon">
          <p>&lt; Author Account Name &gt;</p>
          <img src="monkey.png" alt="no profile picture found" />
        </div>
        <a href="manyStories.html" target="_blank">
          <p>Many Stories</p>
        </a>
      </nav>
      <br />
      <li>
        <label htmlFor="file">File: </label>
        <input type="file" id="file" name="varFile" accept="text/plain" onChange={handleFileChange} />
      </li>
    </div>
  );
}