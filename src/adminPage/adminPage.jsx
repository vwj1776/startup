import React, { useEffect, useState } from 'react';
import './adminPage.css';

export default function AdminPage() {
  const [stats, setStats] = useState({ userCount: 0, storyCount: 0, totalWords: 0, flagCount: 0 });
  const [users, setUsers] = useState([]);
  const [flags, setFlags] = useState([]); 
  const [bannedWords, setBannedWords] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [accessDenied, setAccessDenied] = useState(false);

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

      const [usersRes, settingsRes, flagsRes] = await Promise.all([
        fetch('/api/admin/users', { credentials: 'include' }),
        fetch('/api/admin/settings', { credentials: 'include' }),
        fetch('/api/admin/flags', { credentials: 'include' })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) {
        const allUsers = await usersRes.json();
        setUsers(allUsers.filter(u => u.status !== 'deleted'));
      }
      if (flagsRes.ok) setFlags(await flagsRes.json());
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        setBannedWords(settings.bannedWords || []);
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

  if (loading) return <div className="admin-container">Loading Admin Dashboard...</div>;
  if (accessDenied) return <div className="admin-container">⛔ Access Denied</div>;

  return (
    <div className="admin-container">
      <h1>🛠️ Admin Control Panel</h1>
      
      <div className="admin-tabs">
        <button onClick={() => setActiveTab('stats')} className={activeTab === 'stats' ? 'active' : ''}>Stats</button>
        <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'active' : ''}>Users</button>
        <button onClick={() => setActiveTab('flags')} className={activeTab === 'flags' ? 'active' : ''}>Flags ({flags.length})</button>
        <button onClick={() => setActiveTab('content')} className={activeTab === 'content' ? 'active' : ''}>Moderation</button>
      </div>

      <hr />

      {activeTab === 'stats' && (
        <div className="admin-stats-grid">
          <div className="stat-card"><h3>Users</h3><p>{stats.userCount}</p></div>
          <div className="stat-card"><h3>Stories</h3><p>{stats.storyCount}</p></div>
          <div className="stat-card"><h3>Total Words</h3><p>{stats.totalWords.toLocaleString()}</p></div>
          <div className="stat-card"><h3>Flagged</h3><p style={{color: 'red'}}>{flags.length}</p></div>
        </div>
      )}

      {activeTab === 'users' && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Karma (EZ/Deep)</th>
              <th>Curriculum</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.email}>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.reviewsEZ || 0} / {u.reviewsDeep || 0}</td>
                <td>
                  <input 
                    type="checkbox" 
                    checked={u.curriculumCompleted || false} 
                    onChange={(e) => handleToggleCurriculum(u.email, e.target.checked)}
                  />
                </td>
                <td className={u.status === 'blocked' ? 'status-blocked' : 'status-active'}>
                  {u.status || 'active'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleToggleUserStatus(u.email, u.status)} className="admin-btn block-btn">
                      {u.status === 'blocked' ? 'Unblock' : 'Block'}
                    </button>
                    <button onClick={() => handleDeleteUser(u.email)} className="admin-btn delete-btn">
                      Delete/Ban
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Rest of component (flags/content) remains same... */}
    </div>
  );
}