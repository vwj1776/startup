import React from 'react';
import JokeBanner from '../thirdPartyApi/JokeBanner';

export default function AuthorAccount() {
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== "text/plain") {
      alert("Please upload a text file.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target.result;

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include', // send auth cookie
          body: JSON.stringify({
            content,
            filename: file.name
          })
        });

        const result = await res.json();
        if (res.ok) {
          alert('File uploaded successfully!');
          console.log('Uploaded:', result);
        } else {
          alert('Upload failed: ' + result.msg);
        }
      } catch (err) {
        console.error('Error uploading file:', err);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div id="body-author-account">
      <br />
      <JokeBanner />
      <li>
        <label htmlFor="file">File: </label>
        <input
          type="file"
          id="file"
          name="varFile"
          accept="text/plain" /*change to accept google doc goes here*/
          onChange={handleFileChange}
        />
      </li>
    </div>
  );
}
