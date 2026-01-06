import React, { useEffect, useState } from 'react';
import './manyStories.css';
import { NavLink } from 'react-router-dom';

const ADMIN_USERS = ['vwj1776', 'nodlev', 'vwj1776@gmail.com', 'nodlev76@gmail.com'];

export default function ManyStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  // Get current user from localStorage
  const authorEmail = localStorage.getItem('authorEmail');
  
  // Check if user is admin (case-insensitive and trim whitespace)
  const isAdmin = authorEmail && ADMIN_USERS.some(admin => 
    admin.toLowerCase().trim() === authorEmail.toLowerCase().trim()
  );

  useEffect(() => {
    fetch('/api/stories', {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Not authorized or error loading stories');
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
    setError('');
    try {
      const res = await fetch(`/api/story/${storyId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete story');
      setStories((prev) => prev.filter((s) => s._id !== storyId));
    } catch (err) {
      setError('Error deleting story.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div id="introduction">
        <p>
          The mission of Greyhound is to increase the talent of its members. It will do so by creating a community of writers who will support and assist each other in their efforts.
        </p>
      </div>

      <main>
        <div id="allstories" className="container">
          {loading && <p>Loading stories...</p>}
          {error && <p className="error-msg">{error}</p>}
          {!loading && stories.length === 0 && <p>No stories found.</p>}
          {!loading &&
            stories.map((story) => (
              <div key={story._id} className="stories">
                <NavLink to={`/story/${story._id}`} className="highlighted-link">
                  <p className="title">{story.title}</p>
                  <p>{story.content.slice(0, 120)}...</p>
                  <p>Length: {story.content.split(' ').length} words</p>
                  <p>Author: {story.author}</p>
                </NavLink>
                {isAdmin && (
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(story._id)}
                    disabled={deleting === story._id}
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
