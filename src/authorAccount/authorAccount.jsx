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
      <br />
      <li>
        <label htmlFor="file">File: </label>
        <input type="file" id="file" name="varFile" accept="text/plain" onChange={handleFileChange} />
      </li>
    </div>
  );
}