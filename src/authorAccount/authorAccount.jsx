import React from 'react';
import { useEffect, useState } from "react";
import './authorAccount.css';




 function WritingStreak() {
  const [minMinutes, setMinMinutes] = useState(5);
  const [streak, setStreak] = useState(0);
  const [lastCompletedDate, setLastCompletedDate] = useState(null);

  useEffect(() => {
    const savedStreak = Number(localStorage.getItem("streak")) || 0;
    const savedDate = localStorage.getItem("lastCompletedDate");

    setStreak(savedStreak);
    setLastCompletedDate(savedDate);
  }, []);

  const today = new Date().toDateString();

  const handleConfirmWriting = () => {
    if (lastCompletedDate === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const isContinuingStreak =
      lastCompletedDate === yesterday.toDateString();

    const newStreak = isContinuingStreak ? streak + 1 : 1;

    setStreak(newStreak);
    setLastCompletedDate(today);

    localStorage.setItem("streak", newStreak);
    localStorage.setItem("lastCompletedDate", today);
  };

  return (
    <div className="streak-card">
      <h2>✍️ Writing Streak</h2>

      <div className="streak-count">
        🔥 {streak} day{streak !== 1 && "s"}
      </div>

      <label className="time-setting">
        Minimum writing time (minutes)
        <input
          type="number"
          min="5"
          value={minMinutes}
          onChange={(e) =>
            setMinMinutes(Math.max(5, Number(e.target.value)))
          }
        />
      </label>

      <button
        className="confirm-btn"
        onClick={handleConfirmWriting}
        disabled={lastCompletedDate === today}
      >
        {lastCompletedDate === today
          ? "Already logged today"
          : `I wrote for ${minMinutes}+ minutes`}
      </button>
    </div>
  );
}





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
      <br></br>
      <WritingStreak />
    </div>
  );
}
