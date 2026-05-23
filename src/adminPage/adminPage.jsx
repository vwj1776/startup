import React, { useEffect, useState } from 'react';
import './adminPage.css';

export default function AdminPage() {
  const [stats, setStats] = useState({ userCount: 0, storyCount: 0, totalWords: 0, flagCount: 0 });
  const [users, setUsers] = useState([]);
  const [flags, setFlags] = useState([]); 
  const [allReviews, setAllReviews] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [accessDenied, setAccessDenied] = useState(false);
  const [goals, setGoals] = useState({});

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const statsRes = await fetch('/api/admin/stats', { credentials: 'include' });
      if (statsRes.status === 403) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      const [usersRes, flagsRes, reviewsRes, settingsRes] = await Promise.all([
        fetch('/api/admin/users', { credentials: 'include' }).catch(() => null),
        fetch('/api/admin/flags', { credentials: 'include' }).catch(() => null),
        fetch('/api/admin/reviews', { credentials: 'include' }).catch(() => null),
        fetch('/api/system/settings').catch(() => null) 
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes && usersRes.ok) {
        const allUsers = await usersRes.json();
        setUsers(allUsers.filter(u => u.status !== 'deleted'));
      }
      if (flagsRes && flagsRes.ok) setFlags(await flagsRes.json());
      if (reviewsRes && reviewsRes.ok) {
        setAllReviews(await reviewsRes.json()); 
      }
      if (settingsRes && settingsRes.ok) {
        const settings = await settingsRes.json();
        if (settings.monthlyGoals) setGoals(settings.monthlyGoals);
      }
      setLoading(false);
    } catch (err) {
      console.error("Admin fetch error:", err);
      setLoading(false);
    }
  };

  const handleToggleCurriculum = async (email, completed) => {
    const res = await fetch('/api/admin/user/curriculum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, completed }),
      credentials: 'include'
    });
    if (res.ok) fetchAdminData();
  };

  const handleToggleUserStatus = async (email, currentStatus) => {
    const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    const res = await fetch('/api/admin/user/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, status: newStatus }),
      credentials: 'include'
    });
    if (res.ok) fetchAdminData();
  };

  const handleDeleteUser = async (email) => {
    if (!window.confirm(`BAN and DELETE user ${email}? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/user/${email}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (res.ok) fetchAdminData();
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm(`Delete this review?`)) return;
    const res = await fetch(`/api/admin/review/${reviewId}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) {
      setAllReviews(allReviews.filter(r => r._id !== reviewId));
      alert("Review deleted.");
      fetchAdminData(); // Refresh flags in case the deleted review was flagged
    }
  };

  // --- NEW FLAG ACTIONS ---

  const handleDismissFlag = async (flagId) => {
    if (!window.confirm(`Dismiss this flag? It will be removed from the queue.`)) return;
    const res = await fetch(`/api/admin/flag/${flagId}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) {
      setFlags(flags.filter(f => f._id !== flagId));
    }
  };

  const handleDeleteStory = async (storyId, flagId) => {
    if (!window.confirm("DELETE this story permanently?")) return;
    const res = await fetch(`/api/story/${storyId}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) {
      alert("Story destroyed.");
      // Automatically dismiss the flag since the content is gone
      if (flagId) await handleDismissFlag(flagId);
      fetchAdminData();
    }
  };

  // --- MONTHLY GOALS ACTIONS ---
  const handleSaveGoals = async () => {
    const res = await fetch('/api/admin/goals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goals),
      credentials: 'include'
    });
    if (res.ok) alert("Monthly goals updated successfully!");
    else alert("Failed to update goals.");
  };

  const inputStyle = { padding: '8px', background: '#1B1411', color: '#F5EFE0', border: '1px solid #C19A6B', borderRadius: '4px', width: '100%', fontFamily: 'inherit', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', color: '#8a7b70', marginBottom: '5px', fontWeight: 'bold' };

  if (loading) return <div className="admin-container" style={{fontFamily: "'Courier New', Courier, monospace", color: '#C19A6B', padding: '50px', textAlign: 'center'}}>Loading Admin Dashboard...</div>;
  if (accessDenied) return <div className="admin-container" style={{fontFamily: "'Courier New', Courier, monospace", color: '#cc5555', padding: '50px', textAlign: 'center'}}>⛔ Access Denied</div>;

  return (
    <div className="admin-container" style={{fontFamily: "'Courier New', Courier, monospace", padding: '20px', maxWidth: '1200px', margin: '0 auto'}}>
      <h1 style={{color: '#C19A6B'}}>🛠️ Admin Control Panel</h1>
      
      <div className="admin-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('stats')} style={{ padding: '10px 20px', background: activeTab === 'stats' ? '#C19A6B' : '#2D1E17', color: activeTab === 'stats' ? '#1B1411' : '#C19A6B', border: '1px solid #C19A6B', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 'bold' }}>Stats</button>
        <button onClick={() => setActiveTab('users')} style={{ padding: '10px 20px', background: activeTab === 'users' ? '#C19A6B' : '#2D1E17', color: activeTab === 'users' ? '#1B1411' : '#C19A6B', border: '1px solid #C19A6B', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 'bold' }}>Users</button>
        <button onClick={() => setActiveTab('reviews')} style={{ padding: '10px 20px', background: activeTab === 'reviews' ? '#C19A6B' : '#2D1E17', color: activeTab === 'reviews' ? '#1B1411' : '#C19A6B', border: '1px solid #C19A6B', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 'bold' }}>Reviews ({allReviews.length})</button>
        <button onClick={() => setActiveTab('flags')} style={{ padding: '10px 20px', background: activeTab === 'flags' ? '#cc5555' : '#2D1E17', color: activeTab === 'flags' ? '#fff' : '#cc5555', border: '1px solid #cc5555', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 'bold' }}>
          Flags ({flags.length}) {flags.length > 0 && '⚠️'}
        </button>
        <button onClick={() => setActiveTab('goals')} style={{ padding: '10px 20px', background: activeTab === 'goals' ? '#C19A6B' : '#2D1E17', color: activeTab === 'goals' ? '#1B1411' : '#C19A6B', border: '1px solid #C19A6B', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 'bold' }}>Goals</button>
        <button onClick={() => setActiveTab('broadcast')} style={{ padding: '10px 20px', background: activeTab === 'broadcast' ? '#C19A6B' : '#2D1E17', color: activeTab === 'broadcast' ? '#1B1411' : '#C19A6B', border: '1px solid #C19A6B', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 'bold' }}>Broadcast</button>
      </div>

      <hr style={{ borderColor: '#3e2b22', marginBottom: '20px' }} />

      {/* STATS TAB */}
      {activeTab === 'stats' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div style={{ background: '#2D1E17', padding: '20px', borderRadius: '8px', border: '1px solid #C19A6B', textAlign: 'center' }}>
            <h3 style={{ color: '#8a7b70', margin: '0 0 10px 0' }}>Users</h3>
            <p style={{ fontSize: '2rem', color: '#F5EFE0', margin: 0 }}>{stats.userCount}</p>
          </div>
          <div style={{ background: '#2D1E17', padding: '20px', borderRadius: '8px', border: '1px solid #C19A6B', textAlign: 'center' }}>
            <h3 style={{ color: '#8a7b70', margin: '0 0 10px 0' }}>Stories</h3>
            <p style={{ fontSize: '2rem', color: '#F5EFE0', margin: 0 }}>{stats.storyCount}</p>
          </div>
          <div style={{ background: '#2D1E17', padding: '20px', borderRadius: '8px', border: '1px solid #cc5555', textAlign: 'center' }}>
            <h3 style={{ color: '#cc5555', margin: '0 0 10px 0' }}>Active Flags</h3>
            <p style={{ fontSize: '2rem', color: '#cc5555', margin: 0, fontWeight: 'bold' }}>{flags.length}</p>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '10px', background: '#2D1E17', border: '1px solid #3e2b22'}}>
            <thead>
              <tr style={{borderBottom: '2px solid #C19A6B', color: '#C19A6B', background: '#1B1411'}}>
                <th style={{padding: '12px', textAlign: 'left'}}>Username</th>
                <th style={{padding: '12px', textAlign: 'left'}}>Email</th>
                <th style={{padding: '12px', textAlign: 'left'}}>Points</th>
                <th style={{padding: '12px', textAlign: 'left'}}>Curriculum</th>
                <th style={{padding: '12px', textAlign: 'left'}}>Status</th>
                <th style={{padding: '12px', textAlign: 'left'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.email} style={{borderBottom: '1px solid #3e2b22', color: '#F5EFE0'}}>
                  <td style={{padding: '12px'}}>{u.username}</td>
                  <td style={{padding: '12px'}}>{u.email}</td>
                  <td style={{padding: '12px'}}>{u.points || 0}</td>
                  <td style={{padding: '12px'}}>
                    <input 
                      type="checkbox" 
                      checked={u.curriculumCompleted || false} 
                      onChange={(e) => handleToggleCurriculum(u.email, e.target.checked)}
                      style={{ accentColor: '#C19A6B', cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{padding: '12px', color: u.status === 'blocked' ? '#cc5555' : '#8a7b70', fontWeight: 'bold'}}>
                    {u.status === 'blocked' ? 'BLOCKED' : 'ACTIVE'}
                  </td>
                  <td style={{padding: '12px'}}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleToggleUserStatus(u.email, u.status)} style={{ background: '#1B1411', color: '#C19A6B', border: '1px solid #C19A6B', padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', borderRadius: '4px' }}>
                        {u.status === 'blocked' ? 'Unblock' : 'Block'}
                      </button>
                      <button onClick={() => handleDeleteUser(u.email)} style={{ background: '#cc5555', color: '#fff', border: 'none', padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', borderRadius: '4px' }}>
                        Ban
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* REVIEWS TAB */}
      {activeTab === 'reviews' && (
        <div>
          <p style={{ color: '#8a7b70', marginBottom: '20px' }}>Global review log. Monitor for bullying or low-effort farming.</p>
          {allReviews.map(rev => (
            <div key={rev._id} style={{ background: '#2D1E17', padding: '20px', margin: '15px 0', borderRadius: '8px', border: '1px solid #3e2b22', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #3e2b22', paddingBottom: '10px' }}>
                <strong style={{ color: '#C19A6B', fontSize: '1.1rem' }}>Tier {rev.tier} Review for "{rev.storyTitle}"</strong>
                <button onClick={() => handleDeleteReview(rev._id)} style={{ background: '#cc5555', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 'bold' }}>Delete Review</button>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#8a7b70', marginBottom: '15px' }}><strong>Reviewer:</strong> {rev.reviewerEmail} | <strong>Author:</strong> {rev.storyAuthorEmail}</p>
              
              <div style={{ fontSize: '0.95rem', color: '#dcd6c8', lineHeight: '1.6' }}>
                {rev.content && typeof rev.content === 'object' ? (
                  Object.entries(rev.content).map(([key, val]) => (
                    <div key={key} style={{ marginBottom: '8px' }}>
                      <strong style={{ color: '#C19A6B' }}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {val}
                    </div>
                  ))
                ) : (
                  <p style={{ fontStyle: 'italic' }}>"{rev.content}"</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NEW: FLAGS TAB */}
      {activeTab === 'flags' && (
        <div>
          <p style={{ color: '#8a7b70', marginBottom: '20px' }}>Content reported by the community. Please review and take action.</p>
          {flags.length === 0 ? (
            <div style={{ background: '#1B1411', padding: '40px', textAlign: 'center', border: '1px dashed #C19A6B', borderRadius: '8px', color: '#C19A6B' }}>
              <p>🎉 The queue is empty. Good job, team!</p>
            </div>
          ) : flags.map(flag => (
            <div key={flag._id} style={{ background: '#2D1E17', padding: '20px', margin: '15px 0', borderRadius: '8px', border: '2px solid #cc5555', textAlign: 'left', position: 'relative' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ color: '#cc5555', margin: '0 0 5px 0' }}>🚩 Flagged {flag.type.toUpperCase()}</h3>
                  <strong style={{ color: '#F5EFE0', fontSize: '1.1rem' }}>Target: "{flag.targetTitle || 'Unknown'}"</strong>
                </div>
                
                {/* ACTION BUTTONS */}
                <div style={{display: 'flex', gap: '10px'}}>
                  {flag.type === 'story' && (
                     <button onClick={() => handleDeleteStory(flag.targetId, flag._id)} style={{ background: '#cc5555', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 'bold' }}>Delete Story</button>
                  )}
                  {flag.type === 'review' && (
                     <button onClick={() => handleDeleteReview(flag.targetId)} style={{ background: '#cc5555', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 'bold' }}>Delete Review</button>
                  )}
                  <button onClick={() => handleDismissFlag(flag._id)} style={{ background: '#C19A6B', color: '#1B1411', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'inherit' }}>Dismiss Flag</button>
                </div>
              </div>

              <div style={{ background: '#1B1411', padding: '15px', borderRadius: '4px', border: '1px solid #3e2b22', marginBottom: '15px' }}>
                <p style={{ fontSize: '1rem', color: '#F5EFE0', margin: '0 0 10px 0' }}><strong style={{color: '#cc5555'}}>Reason provided:</strong> {flag.reason}</p>
              </div>
              
              {/* Context Snippet */}
              {flag.content && (
                <div style={{ background: '#1B1411', padding: '15px', borderLeft: '4px solid #8a7b70', fontSize: '0.9rem', color: '#dcd6c8', marginBottom: '15px', fontStyle: 'italic', borderRadius: '0 4px 4px 0' }}>
                   <strong>Content Snippet:</strong><br/><br/>
                   {flag.content}
                </div>
              )}

              <div style={{ fontSize: '0.85rem', color: '#8a7b70', borderTop: '1px solid #3e2b22', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span><strong>Flagged by:</strong> {flag.flaggedBy}</span>
                <span><strong>Date:</strong> {new Date(flag.date).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NEW: GOALS TAB */}
      {activeTab === 'goals' && (
        <div style={{ background: '#2D1E17', padding: '20px', borderRadius: '8px', border: '1px solid #C19A6B' }}>
          <h2 style={{ color: '#C19A6B', margin: '0 0 10px 0' }}>📅 Edit Monthly Goals</h2>
          <p style={{ color: '#8a7b70', marginBottom: '20px' }}>Set the target values for each month's community challenge. These update live on the Story Collection banner!</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            <div><label style={labelStyle}>January (Reviews)</label><input type="number" style={inputStyle} value={goals.januaryReviews || ''} onChange={e => setGoals({...goals, januaryReviews: parseInt(e.target.value) || 0})} /></div>
            <div><label style={labelStyle}>February (Words)</label><input type="number" style={inputStyle} value={goals.februaryWords || ''} onChange={e => setGoals({...goals, februaryWords: parseInt(e.target.value) || 0})} /></div>
            <div><label style={labelStyle}>March (Minutes)</label><input type="number" style={inputStyle} value={goals.marchMinutes || ''} onChange={e => setGoals({...goals, marchMinutes: parseInt(e.target.value) || 0})} /></div>
            <div><label style={labelStyle}>April (Poetry Lines)</label><input type="number" style={inputStyle} value={goals.aprilLines || ''} onChange={e => setGoals({...goals, aprilLines: parseInt(e.target.value) || 0})} /></div>
            <div><label style={labelStyle}>May (Reviews)</label><input type="number" style={inputStyle} value={goals.mayReviews || ''} onChange={e => setGoals({...goals, mayReviews: parseInt(e.target.value) || 0})} /></div>
            <div><label style={labelStyle}>June (Words)</label><input type="number" style={inputStyle} value={goals.juneWords || ''} onChange={e => setGoals({...goals, juneWords: parseInt(e.target.value) || 0})} /></div>
            <div><label style={labelStyle}>July (Stories Uploaded)</label><input type="number" style={inputStyle} value={goals.julyStories || ''} onChange={e => setGoals({...goals, julyStories: parseInt(e.target.value) || 0})} /></div>
            <div><label style={labelStyle}>August (Theme)</label><input type="text" style={inputStyle} value={goals.augustGenre || ''} onChange={e => setGoals({...goals, augustGenre: e.target.value})} /></div>
            <div><label style={labelStyle}>September (Reviews)</label><input type="number" style={inputStyle} value={goals.septemberReviews || ''} onChange={e => setGoals({...goals, septemberReviews: parseInt(e.target.value) || 0})} /></div>
            <div><label style={labelStyle}>October (Spooky Words)</label><input type="number" style={inputStyle} value={goals.octoberWords || ''} onChange={e => setGoals({...goals, octoberWords: parseInt(e.target.value) || 0})} /></div>
            <div><label style={labelStyle}>November (NaNoWriMo Words)</label><input type="number" style={inputStyle} value={goals.novemberWords || ''} onChange={e => setGoals({...goals, novemberWords: parseInt(e.target.value) || 0})} /></div>
            <div><label style={labelStyle}>December (Christmas Words)</label><input type="number" style={inputStyle} value={goals.decemberWords || ''} onChange={e => setGoals({...goals, decemberWords: parseInt(e.target.value) || 0})} /></div>
          </div>

          <button onClick={handleSaveGoals} style={{ marginTop: '20px', padding: '10px 20px', background: '#C19A6B', color: '#1B1411', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'inherit', fontSize: '1.1rem' }}>
            💾 Save Monthly Goals
          </button>
        </div>
      )}

      {/* NEW: BROADCAST TAB */}
      {activeTab === 'broadcast' && (
        <AdminBroadcast />
      )}

    </div>
  );
}

function AdminBroadcast() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleSendBroadcast = async () => {
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message })
      });
      if (res.ok) {
        setStatus('Broadcast sent successfully to all writers!');
        setMessage(''); // clear the form
      } else {
        setStatus('Failed to send broadcast.');
      }
    } catch (err) {
      setStatus('Server error.');
    }
  };

  return (
    <div style={{ backgroundColor: '#2D1E17', padding: '20px', borderRadius: '8px', border: '1px solid #C19A6B', marginBottom: '20px' }}>
      <h3 style={{ color: '#C19A6B', marginTop: 0 }}>Broadcast Popup to Writers</h3>
      <p style={{ color: '#8a7b70', marginBottom: '15px' }}>This message will pop up on every author's screen. They must click "Got it!" to dismiss it.</p>
      <textarea 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type the message you want every writer to see..."
        style={{ width: '100%', height: '100px', padding: '10px', backgroundColor: '#1B1411', color: '#F5EFE0', border: '1px solid #C19A6B', borderRadius: '4px', fontFamily: "'Courier New', Courier, monospace", boxSizing: 'border-box' }}
      />
      <button 
        onClick={handleSendBroadcast}
        style={{ marginTop: '10px', backgroundColor: '#C19A6B', color: '#1B1411', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'inherit' }}
      >
        Send Popup Message
      </button>
      {status && <p style={{ color: status.includes('Failed') || status.includes('error') ? '#cc5555' : '#4CAF50', marginTop: '10px', fontWeight: 'bold' }}>{status}</p>}
    </div>
  );
}