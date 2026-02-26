import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './1ststory.css';

export default function FirstStory() {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [error, setError] = useState('');
  const [reviewType, setReviewType] = useState('ez');
  const [currentUser, setCurrentUser] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    // 1. Get User Data from Port 4000
    fetch('http://localhost:4000/api/user/me', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(user => { 
        if (user) setCurrentUser(user); 
      })
      .catch(err => console.error("User fetch error:", err));

    // 2. Get Story Data from Port 4000
    fetch(`http://localhost:4000/api/story/${id}`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Story not found.');
        return res.json();
      })
      .then((data) => setStory(data))
      .catch((err) => {
        console.error(err);
        setError('Story not found.');
      });
  }, [id]);

  useEffect(() => {
    if (currentUser && story && story.authorEmail) {
      const favorites = currentUser.favorites || [];
      const authorEmail = story.authorEmail.toLowerCase().trim();
      
      const favorited = favorites.some(email => 
        email && email.toLowerCase().trim() === authorEmail
      );
      setIsFavorited(favorited);
    }
  }, [currentUser, story]);

  const handleFavoriteToggle = async () => {
    if (!story?.authorEmail) return;
    try {
      const res = await fetch('http://localhost:4000/api/user/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorEmail: story.authorEmail }),
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setIsFavorited(data.action === 'added');
        
        setCurrentUser(prev => ({
          ...prev,
          favorites: data.action === 'added' 
            ? [...(prev?.favorites || []), story.authorEmail]
            : (prev?.favorites || []).filter(email => email !== story.authorEmail)
        }));
      }
    } catch (err) {
      console.error("Favorite toggle failed", err);
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    const content = event.target.newReview.value.trim();
    if (!content) return;

    try {
      const res = await fetch('http://localhost:4000/api/review', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, storyId: id, type: reviewType }),
      });
      
      if (res.ok) {
        event.target.reset();
        alert(`Feedback sent privately to the author! You earned points.`);
      } else {
        alert("Failed to send review. Check your connection.");
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };

  if (error) return <div className="story-container"><p className="error-msg">{error}</p></div>;
  if (!story) return <div className="story-container"><p style={{color: '#00ff88'}}>Loading story...</p></div>;

  return (
    <div className="story-container">
      <div id="storyInformation">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong style={{fontSize: '1.4rem'}}>{story.title}</strong><br />
            <strong>Author:</strong> {story.author}
          </div>
          {currentUser && (
            <button 
              onClick={handleFavoriteToggle} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.8rem' }}
              title={isFavorited ? "Unfavorite Author" : "Favorite Author"}
            >
              {isFavorited ? '❤️' : '🤍'}
            </button>
          )}
        </div>
      </div>

      <div id="fileContent" className="scrollable-div">
        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'inherit' }}>
          {story.content}
        </pre>
      </div>

      <hr style={{ margin: '40px 0', borderColor: 'rgba(0,255,136,0.2)' }} />

      <div className="review-section">
        <h3>Send Private Feedback</h3>
        <form onSubmit={handleReviewSubmit} className="review-form">
          <div style={{ marginBottom: '15px', display: 'flex', gap: '20px' }}>
            <label style={{ cursor: 'pointer' }}>
              <input type="radio" name="reviewType" checked={reviewType === 'ez'} onChange={() => setReviewType('ez')} /> EZ (+5 pts)
            </label>
            <label style={{ cursor: 'pointer' }}>
              <input type="radio" name="reviewType" checked={reviewType === 'deep'} onChange={() => setReviewType('deep')} /> Deep (+20 pts)
            </label>
          </div>
          <textarea 
            name="newReview" 
            required 
            placeholder="Type your feedback here..."
            style={{ width: '100%', height: '100px', background: '#1c1f24', color: '#fff', border: '1px solid #00ff88', borderRadius: '8px', padding: '12px' }}
          ></textarea>
          <button type="submit" style={{ marginTop: '15px', padding: '12px 24px', background: '#00ff88', color: '#121212', fontWeight: 'bold', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Send Feedback
          </button>
        </form>
      </div>
    </div>
  );
}