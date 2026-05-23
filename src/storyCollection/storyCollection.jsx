import React, { useEffect, useState } from 'react';
import './storyCollection.css';
import { NavLink } from 'react-router-dom';

const ADMIN_USERS = ['vwj1776', 'nodlev', 'vwj1776@gmail.com', 'nodlev76@gmail.com', 'shepardnlyman22@gmail.com'];

export default function StoryCollection() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [monthlyGoals, setMonthlyGoals] = useState(null);
  
  // Filtering States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  const genres = ['All', 'Fantasy', 'Fiction', 'Non-Fiction', 'Horror', 'Poetry', 'Sci-Fi'];

  const isAdmin = currentUser && ADMIN_USERS.some(admin => 
    admin.toLowerCase().trim() === currentUser.toLowerCase().trim()
  );

  useEffect(() => {
    // FIXED: Removed localhost:4000 to use relative routing
    fetch('/api/user/me', { credentials: 'include' })
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((user) => {
        if (user) {
          setCurrentUser(user.email);
          localStorage.setItem('authorEmail', user.email);
        }
      })
      .catch((err) => console.error("User check failed:", err));

    // Fetch dynamic monthly goals
    fetch('/api/system/settings')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data && data.monthlyGoals) setMonthlyGoals(data.monthlyGoals); })
      .catch(err => console.error("Settings fetch error:", err));

    // FIXED: Removed localhost:4000
    fetch('/api/stories/trending', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Error loading stories');
        return res.json();
      })
      .then((data) => {
        setStories(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching stories:', err);
        setError('Failed to load stories.');
        setLoading(false);
      });
  }, []);

  const handleDelete = async (storyId) => {
    if (!window.confirm('Are you sure you want to delete this story?')) return;
    setDeleting(storyId);
    try {
      // FIXED: Removed localhost:4000
      const res = await fetch(`/api/story/${storyId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setStories((prev) => prev.filter((s) => s._id !== storyId));
      }
    } catch (err) {
      setError('Error deleting story.');
    } finally {
      setDeleting(null);
    }
  };

  const filteredStories = stories.filter((story) => {
    const searchMatch = 
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const genreMatch = 
      selectedGenre === 'All' || 
      (story.genre && story.genre.toLowerCase() === selectedGenre.toLowerCase());

    return searchMatch && genreMatch;
  });

  const renderMonthlyGoal = () => {
    if (!monthlyGoals) return "Loading monthly goal...";
    const month = new Date().getMonth();
    switch (month) {
      case 0: return `January Goal: Leave ${monthlyGoals.januaryReviews} thoughtful reviews!`;
      case 1: return `February Goal: Write ${monthlyGoals.februaryWords} words this month!`;
      case 2: return `March Goal: Spend ${monthlyGoals.marchMinutes} minutes writing every day!`;
      case 3: return `April Goal: Poetry month! Aim for ${monthlyGoals.aprilLines} lines of poetry.`;
      case 4: return `May Goal: Leave ${monthlyGoals.mayReviews} thoughtful reviews!`;
      case 5: return `June Goal: Write ${monthlyGoals.juneWords} words this month!`;
      case 6: return `July Goal: Upload ${monthlyGoals.julyStories} new stories!`;
      case 7: return `August Goal: Genre Competition! Which genre will get the most uploads?`;
      case 8: return `September Goal: Leave ${monthlyGoals.septemberReviews} thoughtful reviews!`;
      case 9: return `October Goal: Spooky stuff! Write ${monthlyGoals.octoberWords} words.`;
      case 10: return `November Goal (NaNoWriMo): Write ${monthlyGoals.novemberWords} words!`;
      case 11: return `December Goal: Write ${monthlyGoals.decemberWords} words of Christmas-themed stories!`;
      default: return "Write 1,000 words a month!";
    }
  };

  return (
    <div className="story-page-wrapper">
      <div id="banner">
        <img src="/writing_logo.png" alt="Logo" />
      </div>

      <div id="introduction">
        <p>
          The mission of Greyhound is to increase the talent of its members. It will do so by creating a community of writers who will support and assist each other in their efforts.
        </p>
      </div>

      {/* VIBRANT DYNAMIC GOALS BANNER */}
      <div id="monthlyGoalsBanner" style={{
        background: 'linear-gradient(135deg, #C19A6B, #8a7b70)',
        color: '#1B1411',
        padding: '25px',
        textAlign: 'center',
        fontSize: '1.4rem',
        fontWeight: 'bold',
        borderRadius: '12px',
        margin: '25px 5%',
        border: '3px solid #F5EFE0',
        boxShadow: '0 8px 15px rgba(0,0,0,0.6)'
      }}>
        <p style={{ margin: 0, textShadow: '1px 1px 2px rgba(255,255,255,0.3)' }}>
          <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '10px' }}>🌟 Monthly Challenge 🌟</span>
          {renderMonthlyGoal()}
        </p>
        <p style={{ fontSize: '1rem', marginTop: '15px', fontWeight: 'normal' }}>
          {[0, 4, 8].includes(new Date().getMonth()) ? (
            <>
              Help us achieve this by picking a story below to read and leaving a thoughtful review!
            </>
          ) : (
            <>
              Help us achieve this by visiting your{' '}
              <NavLink to="/authorAccountPage" style={{ color: '#1B1411', textDecoration: 'underline', fontWeight: 'bold' }}>
                author account
              </NavLink>{' '}
              and participating!
            </>
          )}
        </p>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        width: '100%',
        overflowX: 'auto',
        padding: '15px 0',
        marginBottom: '20px',
        borderTop: '1px solid rgba(193, 154, 107, 0.3)', /* Gold */
        borderBottom: '1px solid rgba(193, 154, 107, 0.3)', /* Gold */
        background: '#2D1E17' /* Dark Mahogany */
      }}>
        <div style={{ display: 'flex', gap: '20px', padding: '0 20px' }}>
          {genres.map(genre => (
            <button 
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`genre-link ${selectedGenre === genre ? 'active' : ''}`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 5%', marginBottom: '20px', textAlign: 'center' }}>
        <input
          type="text"
          placeholder={`Search ${selectedGenre === 'All' ? '' : selectedGenre} stories...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '60%',
            padding: '12px 20px',
            borderRadius: '25px',
            border: '2px solid #C19A6B', /* Gold Border */
            background: '#1B1411', /* Deep Espresso */
            color: '#F5EFE0', /* Silk Text */
            fontSize: '1rem',
            outline: 'none',
            fontFamily: 'inherit'
          }}
        />
      </div>

      <main>
        <div id="allstories" className="container">
          {loading && <p>Loading stories...</p>}
          {error && <p className="error-msg">{error}</p>}
          {!loading && filteredStories.length === 0 && (
            <p style={{ color: '#8a7b70', textAlign: 'center', width: '100%' }}>
              No {selectedGenre !== 'All' ? selectedGenre : ''} stories match your search.
            </p>
          )}

          {!loading &&
            filteredStories.map((story) => (
              <div key={story._id} className="stories">
                <NavLink to={`/story/${story._id}`} className="highlighted-link">
                  <p className="title">{story.title}</p>
                  <p>{story.content ? story.content.slice(0, 120) : ''}...</p>
                  <p>Author: {story.author}</p>
                  <p style={{fontStyle: 'italic', fontSize: '0.8rem', color: '#8a7b70'}}>Genre: {story.genre || 'General'}</p>
                </NavLink>
                {isAdmin && (
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(story._id);
                    }}
                    disabled={deleting === story._id}
                    style={{ background: '#cc5555', color: '#fff', border: 'none', marginTop: '10px' }}
                  >
                    {deleting === story._id ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}