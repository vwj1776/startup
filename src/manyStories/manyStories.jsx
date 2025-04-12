import React, { useEffect, useState } from 'react';
import './manyStories.css';
import { NavLink } from 'react-router-dom';

export default function ManyStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div id="introduction">
        <p>
          Greyhound Writing is a platform for you to sell and buy stories online. Stories are mainly
          written by youth, so by buying these stories you are supporting the rising generation of
          our world’s next authors.
        </p>
      </div>

      <main>
        <div id="allstories" className="container">
          {loading && <p>Loading stories...</p>}
          {!loading && stories.length === 0 && <p>No stories found.</p>}
          {!loading &&
            stories.map((story, index) => (
              <NavLink to={`/story/${story._id}`} key={index} className="highlighted-link">
                <div className="stories">
                  <p className="title">{story.title}</p>
                  <p>{story.content.slice(0, 120)}...</p>
                  <p>Length: {story.content.split(' ').length} words</p>
                  <p>Author: {story.author}</p>
                </div>
              </NavLink>
            ))}
        </div>
      </main>
    </div>
  );
}
