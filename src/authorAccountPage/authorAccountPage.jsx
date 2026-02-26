import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './authorAccountPage.css';

// MODIFIED: WritingStreak now takes userEmail to keep data separate
function WritingStreak({ userEmail }) {
  const [minMinutes, setMinMinutes] = useState(5);
  const [streak, setStreak] = useState(0);
  const [lastCompletedDate, setLastCompletedDate] = useState(null);

  const streakKey = `streak_${userEmail}`;
  const dateKey = `lastCompletedDate_${userEmail}`;

  useEffect(() => {
    if (!userEmail) return;
    const savedStreak = Number(localStorage.getItem(streakKey)) || 0;
    const savedDate = localStorage.getItem(dateKey);
    setStreak(savedStreak);
    setLastCompletedDate(savedDate);
  }, [userEmail, streakKey, dateKey]);

  const today = new Date().toDateString();

  const handleConfirmWriting = () => {
    if (lastCompletedDate === today) return;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    const isContinuingStreak = lastCompletedDate === yesterdayStr;
    const newStreak = isContinuingStreak ? streak + 1 : 1;

    setStreak(newStreak);
    setLastCompletedDate(today);
    
    localStorage.setItem(streakKey, newStreak);
    localStorage.setItem(dateKey, today);
  };

  return (
    <div className="streak-card">
      <h2>✍️ Writing Streak</h2>
      <div className="streak-count">🔥 {streak} day{streak !== 1 && "s"}</div>
      <label className="time-setting">
        Minimum writing time (minutes)
        <input 
          type="number" 
          min="5" 
          value={minMinutes} 
          onChange={(e) => setMinMinutes(Math.max(5, Number(e.target.value)))} 
        />
      </label>
      <button 
        className="confirm-btn" 
        onClick={handleConfirmWriting} 
        disabled={lastCompletedDate === today || !userEmail}
      >
        {lastCompletedDate === today ? "Already logged today" : `I wrote for ${minMinutes}+ minutes`}
      </button>
    </div>
  );
}

export default function AuthorAccountPage() {
  const [privateReviews, setPrivateReviews] = useState([]);
  const [myStories, setMyStories] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUsername, setCurrentUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [docLink, setDocLink] = useState('');
  const [docTitle, setDocTitle] = useState('');
  
  const navigate = useNavigate();
  const [selectedGenre, setSelectedGenre] = useState(''); 
  const genres = ['Fantasy', 'Fiction', 'Nonfiction', 'Horror', 'Poetry', 'Sci-Fi'];

  const [showSettings, setShowSettings] = useState(false);
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [newPwConfirm, setNewPwConfirm] = useState('');

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const res = await fetch('/api/notifications', { credentials: 'include' });
        if (res.status === 404) return; 

        if (res.ok) {
          const notes = await res.json();
          if (notes && notes.length > 0) {
            const alertMessage = notes.map(n => n.message).join('\n\n');
            alert("⚠️ MODERATION NOTICE:\n\n" + alertMessage);
            await fetch('/api/notifications/clear', { 
              method: 'POST', 
              credentials: 'include' 
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    if (!loading && currentUser) {
      checkNotifications();
    }
  }, [loading, currentUser]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch('/api/user/me', { credentials: 'include' });
        if (!userRes.ok) throw new Error('Not logged in');
        const user = await userRes.json();
        
        if (!user.hasPledged) {
          navigate('/pledge');
          return;
        }

        setCurrentUser(user.email);
        setCurrentUsername(user.username || user.email);
        setIsAdmin(user.isAdmin || false);

        const storyRes = await fetch('/api/stories/trending', { credentials: 'include' });
        const allStories = await storyRes.json();
        
        const filtered = allStories.filter(s => 
          s.author === user.username || 
          s.author === user.email || 
          s.authorEmail === user.email
        );
        setMyStories(filtered);

        const reviewRes = await fetch('/api/author/private-reviews', { credentials: 'include' });
        if (reviewRes.ok) {
          const reviewData = await reviewRes.json();
          setPrivateReviews(reviewData);
        }

        setLoading(false);
      } catch (err) {
        console.error("Session error:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPw !== newPwConfirm) return alert("New passwords don't match!");
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ oldPw, newPw })
      });
      if (res.ok) {
        alert("Password updated!");
        setShowSettings(false);
      }
    } catch (err) { alert("Error."); }
  };

  const handleLinkUpload = async () => {
    if (!docLink || !docTitle || !selectedGenre) return alert("Please fill Title, Link, and Genre.");
    try {
      const res = await fetch('/api/import-google-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ url: docLink, title: docTitle, genre: selectedGenre })
      });
      if (res.ok) {
        const data = await res.json();
        setMyStories(prev => [...prev, data.story]);
        setDocLink(''); setDocTitle('');
        alert('Imported!');
      }
    } catch (err) { console.error(err); }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !selectedGenre) return alert("Select genre first.");
    const reader = new FileReader();
    reader.onload = async (e) => {
      const res = await fetch('/api/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: e.target.result, title: file.name, genre: selectedGenre })
      });
      if (res.ok) {
        alert('Uploaded! Refreshing library...');
        window.location.reload(); 
      }
    };
    reader.readAsText(file);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this story forever?")) return;
    try {
      const res = await fetch(`/api/story/${id}`, { 
        method: 'DELETE', 
        credentials: 'include' 
      });
      if (res.ok) {
        setMyStories(myStories.filter(s => s._id !== id));
        alert("Story deleted successfully.");
      } else {
        const err = await res.json();
        alert("Failed to delete: " + (err.msg || "Unknown error"));
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Network error.");
    }
  };

  const groupedReviews = privateReviews.reduce((acc, rev) => {
    const title = rev.storyTitle || "General Feedback";
    if (!acc[title]) acc[title] = [];
    acc[title].push(rev);
    return acc;
  }, {});

  if (loading) return <p style={{color: '#00ff88', padding: '20px'}}>Loading your account...</p>;
  if (!currentUser) return <p style={{color: '#00ff88', padding: '20px'}}>Please log in.</p>;

  return (
    <div id="body-author-account">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Welcome, {currentUsername}</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isAdmin && (
            <button 
              onClick={() => navigate('/admin')} 
              style={{ background: '#ff4444', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              🛠️ Admin Dashboard
            </button>
          )}
          <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: '1px solid #00ff88', color: '#00ff88', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>
            ⚙️ Settings
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
          <div className="modal-content" style={{backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '10px', border: '2px solid #00ff88', width: '400px'}}>
             <h2 style={{color: '#00ff88'}}>Account Settings</h2>
             <input type="password" placeholder="Old Password" value={oldPw} onChange={e => setOldPw(e.target.value)} style={{width: '100%', marginBottom: '10px'}} />
             <input type="password" placeholder="New Password" value={newPw} onChange={e => setNewPw(e.target.value)} style={{width: '100%', marginBottom: '10px'}} />
             <input type="password" placeholder="Confirm New Password" value={newPwConfirm} onChange={e => setNewPwConfirm(e.target.value)} style={{width: '100%', marginBottom: '20px'}} />
             <button onClick={handlePasswordChange} className="confirm-btn">Update</button>
             <button onClick={() => setShowSettings(false)} style={{marginLeft: '10px'}}>Cancel</button>
          </div>
        </div>
      )}

      <div className="upload-section">
          <div className="import-box">
            <h4>Import from Google Docs</h4>
            <input type="text" placeholder="Title" value={docTitle} onChange={e => setDocTitle(e.target.value)} />
            <input type="text" placeholder="Link" value={docLink} onChange={e => setDocLink(e.target.value)} />
            <select value={selectedGenre} onChange={e => setSelectedGenre(e.target.value)}>
               <option value="" disabled>-- Genre --</option>
               {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <button onClick={handleLinkUpload} className="confirm-btn">Import</button>
          </div>

          <div className="import-box">
            <h4>Upload .txt File</h4>
            <select value={selectedGenre} onChange={e => setSelectedGenre(e.target.value)} style={{marginBottom: '10px'}}>
               <option value="" disabled>-- Genre --</option>
               {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <input type="file" accept="text/plain" onChange={handleFileChange} />
          </div>
      </div>

      <div className="author-library-section">
        <h2>📚 My Library ({myStories.length})</h2>
        <div className="story-grid-author">
          {myStories.length === 0 ? <p style={{color: '#888'}}>No stories found.</p> : myStories.map((story) => (
            <div key={story._id} className="story-card-mini">
              <div>
                <h4>{story.title}</h4>
                <span className="genre-label">{story.genre || 'General'}</span>
              </div>
              <div className="story-card-actions-row">
                {/* FIXED: Using /write/ to match App.jsx routes */}
                <button className="btn-reupload" onClick={() => navigate(`/write/${story._id}`)}>Edit</button>
                <button className="btn-delete-small" onClick={() => handleDelete(story._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div id="streakAndCultureGoals">
        <WritingStreak userEmail={currentUser} />
        <div className="culture-card">
          <h2>📌 Monthly Goal</h2>
          <p>Write a thousand words!</p>
        </div>
      </div>

      <div className="reviews-container">
        <h2>📬 Private Feedback</h2>
        {privateReviews.length === 0 ? (
          <p style={{color: '#888', padding: '10px'}}>No feedback yet. Keep writing!</p>
        ) : (
          Object.entries(groupedReviews).map(([title, reviews]) => (
            <div key={title} className="story-group" style={{ marginBottom: '20px' }}>
              <h3 style={{ borderBottom: '1px solid #00ff88', color: '#00ff88', paddingBottom: '5px' }}>
                Story: {title}
              </h3>
              {reviews.map((rev, i) => (
                <div key={i} className="review-card" style={{ background: '#1c1f24', margin: '10px 0', padding: '15px', borderRadius: '8px' }}>
                  <p style={{ fontStyle: 'italic', marginBottom: '10px' }}>"{rev.content}"</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#888' }}>
                    <span>From: {rev.author}</span>
                    <span>{rev.date ? new Date(rev.date).toLocaleDateString() : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}