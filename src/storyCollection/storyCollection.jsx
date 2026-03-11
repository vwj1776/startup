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

      <div id="monthlyGoalsBanner">
        <p>
          As a website our goal is to write 1,000 words a month. Help us with that goal by going to your{' '}
          <NavLink to="/authorAccountPage" id="authorAccountLink">
            author account
          </NavLink>{' '}
          and uploading your latest stories!
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
              style={{
                background: 'none',
                border: 'none',
                color: selectedGenre === genre ? '#C19A6B' : '#8a7b70', /* Gold vs Muted Silk */
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                padding: '5px 0',
                borderBottom: selectedGenre === genre ? '2px solid #C19A6B' : '2px solid transparent',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
                fontFamily: 'Georgia, serif'
              }}
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