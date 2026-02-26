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

  const genres = ['Fiction', 'Non-Fiction', 'Poetry', 'Sci-Fi', 'Fantasy', 'Horror',];

  useEffect(() => {
    if (storyId) {
      fetch('http://localhost:4000/api/stories/trending', { credentials: 'include' })
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
      const userRes = await fetch('http://localhost:4000/api/user/me', { credentials: 'include' });
      if (!userRes.ok) throw new Error("Not logged in");
      
      const url = storyId 
        ? `http://localhost:4000/api/story/${storyId}` 
        : 'http://localhost:4000/api/story';
      
      const method = storyId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, content, genre })
      });

      // SAFETY CHECK: If res is not ok, don't try to .json() it yet
      if (res.ok) {
        alert(storyId ? "Story Updated!" : "Published!");
        navigate('/authorAccountPage');
      } else {
        // If it's a 404, it might return HTML, so we check content-type
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

  if (loading) return <div style={{color: '#00ff88', textAlign: 'center', marginTop: '50px'}}>Loading story for editing...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', background: '#121417', color: '#00ff88', borderRadius: '12px', border: '1px solid #00ff88' }}>
      <h2 style={{ textAlign: 'center' }}>{storyId ? 'Edit' : 'Write'} Story</h2>
      <input 
        type="text" 
        placeholder="Title" 
        value={title} 
        onChange={e => setTitle(e.target.value)} 
        style={{ width: '100%', marginBottom: '10px', padding: '10px', background: '#222', color: 'white', border: '1px solid #00ff88', borderRadius: '4px' }}
      />
      <select 
        value={genre} 
        onChange={e => setGenre(e.target.value)} 
        style={{ width: '100%', marginBottom: '10px', padding: '10px', background: '#222', color: '#00ff88', border: '1px solid #00ff88', borderRadius: '4px' }}
      >
        <option value="">Select Genre</option>
        {genres.map(g => <option key={g} value={g}>{g}</option>)}
      </select>
      <textarea 
        placeholder="Write here..." 
        value={content} 
        onChange={e => setContent(e.target.value)} 
        style={{ width: '100%', height: '300px', padding: '10px', background: '#222', color: 'white', border: '1px solid #00ff88', borderRadius: '4px', resize: 'vertical' }}
      />
      <button 
        onClick={handleSave} 
        disabled={saving} 
        style={{ width: '100%', padding: '15px', marginTop: '10px', background: '#00ff88', color: 'black', fontWeight: 'bold', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        {saving ? 'Saving...' : (storyId ? 'Update Story' : 'Publish Story')}
      </button>
    </div>
  );
}