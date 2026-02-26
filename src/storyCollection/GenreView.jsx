import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './genreView.css'; // You can style this similarly to storyCollection.css

export default function GenreView() {
  const { genreName } = useParams();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenreStories = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/stories/genre/${genreName}`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setStories(data);
        }
      } catch (error) {
        console.error('Error fetching genre stories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGenreStories();
  }, [genreName]);

  return (
    <div className="genre-container">
      <header className="genre-header">
        <h2>Genre: {genreName.charAt(0).toUpperCase() + genreName.slice(1)}</h2>
        <Link to="/storyCollection" className="back-link">← Back to All Stories</Link>
      </header>

      {loading ? (
        <p>Loading {genreName} stories...</p>
      ) : stories.length > 0 ? (
        <div className="story-grid">
          {stories.map((story) => (
            <div key={story._id} className="story-card">
              <h3>{story.title}</h3>
              <p className="author-tag">By: {story.author}</p>
              <Link to={`/story/${story._id}`} className="read-btn">Read Story</Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-stories">No stories found in this genre yet. Be the first to write one!</p>
      )}
    </div>
  );
}