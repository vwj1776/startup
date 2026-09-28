import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './authorAccountPage.css';

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
      <label className="time-setting" style={{color: '#8a7b70', fontSize: '0.9rem'}}>
        Minimum writing time (minutes)
        <input 
          type="number" min="5" value={minMinutes} 
          onChange={(e) => setMinMinutes(Math.max(5, Number(e.target.value)))} 
          style={{marginLeft: '10px', background: '#1B1411', border: '1px solid #C19A6B', color: '#F5EFE0', padding: '5px'}}
        />
      </label>
      <button 
        className="confirm-btn" onClick={handleConfirmWriting} 
        disabled={lastCompletedDate === today || !userEmail}
      >
        {lastCompletedDate === today ? "Already logged today" : `I wrote for ${minMinutes}+ minutes`}
      </button>
    </div>
  );
}

function PromptExchange({ userEmail, navigate, projects }) {
  const [recommendedPrompts, setRecommendedPrompts] = useState([]);
  const [newPromptText, setNewPromptText] = useState('');
  const [loadingPrompts, setLoadingPrompts] = useState(true);

  const fetchRecommendedPrompts = async () => {
    setLoadingPrompts(true);
    try {
      const res = await fetch('/api/prompts/recommended', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setRecommendedPrompts(data);
      } else {
        setRecommendedPrompts([]);
      }
    } catch (err) { 
      console.error("Failed to fetch prompts", err); 
      setRecommendedPrompts([]);
    } finally {
      setLoadingPrompts(false);
    }
  };

  useEffect(() => {
    if (userEmail) fetchRecommendedPrompts();
  }, [userEmail]);

  const handleAcceptPrompt = async (prompt) => {
    if (!prompt || !prompt._id) return;
    try {
      const res = await fetch('/api/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: prompt.text,
          content: `\n\n---\nPrompt: ${prompt.text}`,
          genre: 'Fiction', // Default genre
          status: 'draft',
          promptId: prompt._id.toString()
        })
      });
      if (res.ok) {
        const { story } = await res.json();
        navigate(`/write/${story._id}`);
      } else { 
        const errorData = await res.json().catch(() => ({}));
        alert(`Could not start prompt project: ${errorData.msg || 'Server error'}`);
      }
    } catch (err) { 
      console.error("Error accepting prompt:", err);
      alert("Error accepting prompt. Check console for details."); 
    }
  };

  const handleDenyPrompt = async (prompt) => {
    if (!prompt || !prompt._id) return;
    try {
      await fetch(`/api/prompts/${prompt._id}/deny`, { method: 'POST', credentials: 'include' });
      fetchRecommendedPrompts(); // Refetch to get a new list
    } catch (err) { 
      console.error("Error denying prompt:", err);
      alert("Error denying prompt."); 
    }
  };

  const handleSubmitPrompt = async () => {
    const trimmedText = newPromptText.trim();
    if (!trimmedText) return alert("Prompt cannot be empty.");
    
    const wordCount = trimmedText.split(/\s+/).filter(Boolean).length;
    if (wordCount > 100) {
      return alert("Prompt cannot exceed 100 words.");
    }

    try {
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: trimmedText })
      });
      if (res.ok) {
        alert("Prompt submitted!");
        setNewPromptText('');
      } else { 
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to submit prompt: ${errorData.msg || 'Server error'}`);
      }
    } catch (err) { 
      console.error("Error submitting prompt:", err);
      alert("Error submitting prompt."); 
    }
  };

  const workingOnPrompts = projects.filter(p => p.promptId);

  return (
    <div className="prompt-exchange-container">
      <h3>💡 Prompt Exchange</h3>
      <div className="prompt-exchange-card">
        <div className="prompt-left">
          <h4>Recommended Prompts</h4>
          <div className="prompt-recommendation-list">
            {loadingPrompts ? <p>Loading prompts...</p> : 
             recommendedPrompts.length > 0 ? recommendedPrompts.map(prompt => (
              <div key={prompt._id} className="prompt-recommendation-box">
                <p className="prompt-text">{prompt.text}</p>
                <div className="prompt-actions">
                  <button onClick={() => handleDenyPrompt(prompt)}>Deny</button>
                  <button onClick={() => handleAcceptPrompt(prompt)}>Accept</button>
                </div>
              </div>
            )) : <p className="wip-empty">No new prompts available right now. Check back later!</p>}
          </div>
        </div>
        <div className="prompt-right">
          <div className="prompt-wip">
            <h5>Working On</h5>
            <div className="wip-list">
              {workingOnPrompts.length > 0 ? (
                workingOnPrompts.map(p => <Link key={p._id} to={`/write/${p._id}`} className="wip-item">{p.title}</Link>)
              ) : (
                <span className="wip-empty">No active prompts.</span>
              )}
            </div>
          </div>
          <div className="prompt-submission">
            <h5>Add a Prompt (100 word limit)</h5>
            <textarea 
              placeholder="Share a story idea..." 
              value={newPromptText} 
              onChange={e => setNewPromptText(e.target.value)} 
              maxLength="600"
            />
            <button onClick={handleSubmitPrompt}>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StoriesFromMyPrompts({ userEmail }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userEmail) return;

    const fetchStories = async () => {
      try {
        const res = await fetch('/api/author/stories-from-my-prompts', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setStories(data);
        }
      } catch (err) {
        console.error("Failed to fetch stories from your prompts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [userEmail]);

  return (
    <div className="author-library-section">
      <h2>📣 Stories From Your Prompts ({stories.length})</h2>
      <div className="story-grid-author">
        {loading ? (
          <p style={{ color: '#8a7b70', fontStyle: 'italic' }}>Loading stories...</p>
        ) : stories.length === 0 ? (
          <p style={{ color: '#8a7b70', fontStyle: 'italic' }}>No stories have been published from your prompts yet.</p>
        ) : (
          stories.map((story) => (
            <div key={story._id} className="story-card-mini" onClick={() => navigate(`/story/${story._id}`)} style={{cursor: 'pointer'}}>
              <div>
                <h4>{story.title}</h4>
                <p style={{fontSize: '0.8rem', color: '#8a7b70', margin: '5px 0 0 0'}}>Written by: {story.author}</p>
              </div>
              <span className="genre-label">{story.genre || 'General'}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function AuthorAccountPage() {
  const [privateReviews, setPrivateReviews] = useState([]);
  const [myStories, setMyStories] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUsername, setCurrentUsername] = useState('');
  const [userPoints, setUserPoints] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dismissedBroadcastId, setDismissedBroadcastId] = useState(null);
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
    const fetchData = async () => {
      try {
        const userRes = await fetch('/api/user/me', { credentials: 'include' });
        if (!userRes.ok) throw new Error('Not logged in');
        const user = await userRes.json();
        
        // RESTORED REDIRECT: Only triggers if hasPledged is explicitly false
        // if (user.hasPledged === false) {
        //   navigate('/pledge');
        //   return;
        // }

        setCurrentUser(user.email);
        setCurrentUsername(user.username || user.email);
        setUserPoints(user.points || 0);
        setIsAdmin(user.isAdmin || false);
        setDismissedBroadcastId(user.dismissedBroadcastId || null);
        
        const storyRes = await fetch('/api/author/my-stories', { credentials: 'include' });
        if (!storyRes.ok) {
          console.error('Failed to fetch stories, server responded with:', storyRes.status);
          // Set to empty arrays to prevent crash
          setMyStories([]);
          setMyProjects([]);
        } else {
          const allUserStories = await storyRes.json();
          if (Array.isArray(allUserStories)) {
            const published = allUserStories.filter(s => s.status !== 'draft');
            const drafts = allUserStories.filter(s => s.status === 'draft');
            setMyStories(published);
            setMyProjects(drafts);
          }
        }

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
  }, []);

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
        setOldPw('');
        setNewPw('');
        setNewPwConfirm('');
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Failed to update password: ${data.msg || 'Invalid old password or server error.'}`);
      }
    } catch (err) { 
      alert("Server error."); 
    }
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
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return alert(data.msg || `Import failed (${res.status}).`);
      setMyStories(prev => [...prev, data.story]);
      setDocLink(''); setDocTitle('');
      alert('Imported!');
    } catch (err) {
      console.error(err);
      alert('Could not reach the server. Please try again.');
    }
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
      const res = await fetch(`/api/story/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setMyStories(myStories.filter(s => s._id !== id));
        setMyProjects(myProjects.filter(p => p._id !== id));
        alert("Story deleted successfully.");
      }
    } catch (err) { alert("Network error."); }
  };

  const groupedReviews = privateReviews.reduce((acc, rev) => {
    const title = rev.storyTitle || "General Feedback";
    if (!acc[title]) acc[title] = [];
    acc[title].push(rev);
    return acc;
  }, {});

  if (loading) return <p style={{color: '#C19A6B', padding: '50px', textAlign: 'center', fontFamily: 'Georgia, serif'}}>Loading your account...</p>;
  if (!currentUser) return <p style={{color: '#C19A6B', padding: '50px', textAlign: 'center', fontFamily: 'Georgia, serif'}}>Please log in.</p>;

  return (
    <div id="body-author-account">
      <BroadcastPopup initialDismissedId={dismissedBroadcastId} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #3e2b22', paddingBottom: '20px', marginBottom: '30px' }}>
        <h3 style={{margin: 0}}>Welcome, {currentUsername}</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isAdmin && (
            <button 
              onClick={() => navigate('/admin')} 
              style={{ background: '#cc5555', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Georgia, serif' }}
            >
              🛠️ Admin Dashboard
            </button>
          )}
          <button onClick={() => navigate('/authorInfo')} style={{ background: '#2D1E17', border: '1px solid #C19A6B', color: '#C19A6B', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>
            👤 Author Info
          </button>
          <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: '1px solid #C19A6B', color: '#C19A6B', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
            ⚙️ Settings
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
          <div className="modal-content" style={{backgroundColor: '#2D1E17', padding: '40px', borderRadius: '8px', border: '1px solid #C19A6B', width: '400px', boxShadow: '0 0 30px rgba(0,0,0,0.5)'}}>
             <h2 style={{color: '#C19A6B', marginTop: 0}}>Account Settings</h2>
             <p style={{color: '#8a7b70', fontSize: '0.8rem', marginBottom: '20px'}}>Update your security credentials below.</p>
             <input type="password" placeholder="Old Password" value={oldPw} onChange={e => setOldPw(e.target.value)} style={{width: '100%', marginBottom: '15px', padding: '12px', background: '#1B1411', border: '1px solid #3e2b22', color: '#F5EFE0'}} />
             <input type="password" placeholder="New Password" value={newPw} onChange={e => setNewPw(e.target.value)} style={{width: '100%', marginBottom: '15px', padding: '12px', background: '#1B1411', border: '1px solid #3e2b22', color: '#F5EFE0'}} />
             <input type="password" placeholder="Confirm New Password" value={newPwConfirm} onChange={e => setNewPwConfirm(e.target.value)} style={{width: '100%', marginBottom: '25px', padding: '12px', background: '#1B1411', border: '1px solid #3e2b22', color: '#F5EFE0'}} />
             <div style={{display: 'flex', gap: '10px'}}>
                <button onClick={handlePasswordChange} className="confirm-btn" style={{flex: 2}}>Update Password</button>
                <button onClick={() => setShowSettings(false)} style={{flex: 1, background: 'none', border: '1px solid #8a7b70', color: '#8a7b70', cursor: 'pointer', borderRadius: '4px'}}>Cancel</button>
             </div>
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
            <input type="file" accept="text/plain" onChange={handleFileChange} style={{color: '#8a7b70', fontSize: '0.8rem'}} />
          </div>
      </div>

      <div id="streakAndCultureGoals">
        <WritingStreak userEmail={currentUser} />
        <div className="culture-card">
          <h2>📌 Monthly Goal</h2>
          <p style={{fontSize: '1.2rem', color: '#F5EFE0'}}>Write a thousand words!</p>
          <p style={{fontSize: '0.9rem', color: '#8a7b70', marginTop: '10px'}}>You're part of a community of active writers.</p>
        </div>
      </div>

      <PromptExchange userEmail={currentUser} navigate={navigate} projects={myProjects} />

      <StoriesFromMyPrompts userEmail={currentUser} />

      <div className="author-library-section">
        <h2>📚 My Library ({myStories.length})</h2>
        <div className="story-grid-author">
          {myStories.length === 0 ? <p style={{color: '#8a7b70', fontStyle: 'italic'}}>Your library is currently empty.</p> : myStories.map((story) => (
            <div key={story._id} className="story-card-mini">
              <div>
                <h4>{story.title}</h4>
                <span className="genre-label">{story.genre || 'General'}</span>
              </div>
              <div className="story-card-actions-row">
                <button className="btn-reupload" onClick={() => navigate(`/write/${story._id}`)}>Edit</button>
                <button className="btn-delete-small" onClick={() => handleDelete(story._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="reviews-container">
        <h2>📬 Private Feedback</h2>
        {privateReviews.length === 0 ? (
          <p style={{color: '#8a7b70', padding: '20px', fontStyle: 'italic'}}>No feedback received yet. Keep sharing your work!</p>
        ) : (
          Object.entries(groupedReviews).map(([title, reviews]) => (
            <div key={title} className="story-group" style={{ marginBottom: '30px' }}>
              <h3 style={{ borderBottom: '1px solid #C19A6B', color: '#F5EFE0', paddingBottom: '10px' }}>
                Story: <span style={{color: '#C19A6B'}}>{title}</span>
              </h3>
              {reviews.map((rev, i) => (
                <div key={i} className="review-card" style={{ background: '#1B1411', margin: '15px 0', padding: '20px', borderRadius: '4px', borderLeft: `4px solid ${rev.tier === 3 ? '#C19A6B' : rev.tier === 2 ? '#a8855b' : '#3e2b22'}` }}>
                  <p style={{ fontWeight: 'bold', color: '#C19A6B', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>Level {rev.tier || 1} Feedback</p>
                  
                  {rev.content && typeof rev.content === 'object' ? (
                    <div style={{ fontSize: '1rem', color: '#dcd6c8', lineHeight: '1.6' }}>
                      {Object.entries(rev.content).map(([key, val]) => (
                        <div key={key} style={{ marginBottom: '12px' }}>
                          <strong style={{ color: '#C19A6B', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</strong> 
                          <span style={{display: 'block', marginTop: '4px'}}>{val}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontStyle: 'italic', marginBottom: '10px', color: '#dcd6c8' }}>"{rev.content}"</p>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#8a7b70', marginTop: '20px', borderTop: '1px solid #2D1E17', paddingTop: '10px' }}>
                    <span>From: {rev.author || rev.reviewerEmail}</span>
                    <span>{rev.date ? new Date(rev.date).toLocaleDateString() : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
      <div className="author-library-section">
        <h2>📝 My Projects ({myProjects.length})</h2>
        <div className="story-grid-author">
          {myProjects.length === 0 ? <p style={{color: '#8a7b70', fontStyle: 'italic'}}>No active projects. Start one from a prompt!</p> : myProjects.map((story) => (
            <div key={story._id} className="story-card-mini project-card">
              <div>
                <h4>{story.title}</h4>
                <span className="genre-label">{story.genre || 'Draft'}</span>
              </div>
              <div className="story-card-actions-row">
                <button className="btn-reupload" onClick={() => navigate(`/write/${story._id}`)}>Edit</button>
                <button className="btn-delete-small" onClick={() => handleDelete(story._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BroadcastPopup({ initialDismissedId }) {
  const [broadcast, setBroadcast] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchBroadcast = async () => {
      try {
        const res = await fetch('/api/broadcast');
        if (res.ok) {
          const data = await res.json();
          // Check if there is an active message
          if (data.message && data.messageId) {
            const dismissedId = localStorage.getItem('dismissedBroadcastId');
            // If the user hasn't dismissed this specific message ID yet, show it
            if (dismissedId !== data.messageId && initialDismissedId !== data.messageId) {
              setBroadcast(data);
              setIsVisible(true);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch broadcast", err);
      }
    };
    fetchBroadcast();
  }, [initialDismissedId]);

  const handleDismiss = async () => {
    if (broadcast) {
      // Save the ID so they never see THIS specific message again
      localStorage.setItem('dismissedBroadcastId', broadcast.messageId);
      setIsVisible(false);

      // Also persist it to the database so it survives logouts
      try {
        await fetch('/api/user/dismiss-broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ messageId: broadcast.messageId })
        });
      } catch (err) {
        console.error("Failed to persist dismissal", err);
      }
    }
  };

  if (!isVisible || !broadcast) return null;

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
      <div className="modal-content" style={{ backgroundColor: '#2D1E17', border: '2px solid #C19A6B', borderRadius: '10px', padding: '30px', maxWidth: '500px', width: '90%', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.6)' }}>
        <h2 style={{ color: '#C19A6B', marginTop: 0 }}>Admin Announcement</h2>
        <p style={{ color: '#F5EFE0', fontSize: '1.1rem', lineHeight: '1.5', margin: '20px 0' }}>
          {broadcast.message}
        </p>
        <button onClick={handleDismiss} className="confirm-btn" style={{ padding: '10px 30px', width: 'auto' }}>
          Got it!
        </button>
      </div>
    </div>
  );
}