import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function WritingEditor() {
  const { storyId } = useParams(); 
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [genre, setGenre] = useState('');
  const [loading, setLoading] = useState(!!storyId);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const genres = ['Fiction', 'Non-Fiction', 'Poetry', 'Sci-Fi', 'Fantasy', 'Horror'];

  useEffect(() => {
    if (storyId) {
      // FIXED: Removed localhost:4000 for relative routing
      fetch('/api/stories/trending', { credentials: 'include' })
        .then(res => res.json())
        .then(stories => {
          const story = stories.find(s => s._id === storyId);
          if (story) {
            setTitle(story.title || '');
            setContent(story.content || '');
            setGenre(story.genre || '');
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Error loading story:", err);
          setLoading(false);
        });
    }
  }, [storyId]);

  const handleSave = async () => {
    if (!title || !content || !genre) {
      alert("Please fill in all fields.");
      return;
    }

    setSaving(true);
    try {
      // FIXED: Removed localhost:4000
      const userRes = await fetch('/api/user/me', { credentials: 'include' });
      if (!userRes.ok) throw new Error("Not logged in");
      
      const url = storyId 
        ? `/api/story/${storyId}` 
        : '/api/story';
      
      const method = storyId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, content, genre })
      });

      if (res.ok) {
        alert(storyId ? "Story Updated!" : "Published!");
        navigate('/authorAccountPage');
      } else {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const errorData = await res.json();
            alert(`Failed: ${errorData.msg || 'Unknown error'}`);
        } else {
            alert(`Server Error: ${res.status}. Your backend is likely missing the PUT route.`);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{color: '#C19A6B', textAlign: 'center', marginTop: '50px'}}>Loading story for editing...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '30px', background: '#1B1411', color: '#F5EFE0', borderRadius: '8px', border: '1px solid #C19A6B', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
      <h2 style={{ textAlign: 'center', color: '#C19A6B', marginBottom: '25px', letterSpacing: '1px' }}>{storyId ? 'Edit' : 'Write'} Story</h2>
      
      <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#C19A6B' }}>Title</label>
      <input 
        type="text" 
        placeholder="Title" 
        value={title} 
        onChange={e => setTitle(e.target.value)} 
        style={{ width: '100%', marginBottom: '15px', padding: '12px', background: '#2D1E17', color: '#F5EFE0', border: '1px solid #3e2b22', borderRadius: '4px', outline: 'none' }}
      />

      <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#C19A6B' }}>Genre</label>
      <select 
        value={genre} 
        onChange={e => setGenre(e.target.value)} 
        style={{ width: '100%', marginBottom: '15px', padding: '12px', background: '#2D1E17', color: '#F5EFE0', border: '1px solid #3e2b22', borderRadius: '4px', outline: 'none' }}
      >
        <option value="">Select Genre</option>
        {genres.map(g => <option key={g} value={g}>{g}</option>)}
      </select>

      <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#C19A6B' }}>Story Content</label>
      <textarea 
        placeholder="Write here..." 
        value={content} 
        onChange={e => setContent(e.target.value)} 
        style={{ width: '100%', height: '400px', padding: '15px', background: '#2D1E17', color: '#F5EFE0', border: '1px solid #3e2b22', borderRadius: '4px', resize: 'vertical', lineHeight: '1.6', outline: 'none' }}
      />

      <button 
        onClick={handleSave} 
        disabled={saving} 
        style={{ width: '100%', padding: '15px', marginTop: '20px', background: '#C19A6B', color: '#1B1411', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1rem', transition: 'background 0.3s' }}
        onMouseOver={(e) => e.target.style.background = '#a8855b'}
        onMouseOut={(e) => e.target.style.background = '#C19A6B'}
      >
        {saving ? 'Saving...' : (storyId ? 'Update Story' : 'Publish Story')}
      </button>
    </div>
  );
}