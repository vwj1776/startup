import React, { useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import './1ststory.css';

export default function StoryView() {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // User Data
  const [userPoints, setUserPoints] = useState(0);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');

  // Form States
  const [activeTier, setActiveTier] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Structured form data
  const [formData, setFormData] = useState({
    shortEnjoyed: '', shortImprove: '',
    scaleDialogue: 3, scaleDetail: 3, scaleRealism: 3, scaleProtagonist: 3, scaleAntagonist: 3, scalePlot: 3,
    recommend: '', shortTheme: '', mediumAuthorChoice: '',
    longTheme: '', longEnjoyed: '', longImprove: '', longEnforceTheme: '', longWeight: '', longAdvice: ''
  });

  // FLAG STATES
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagReason, setFlagReason] = useState('');

  useEffect(() => {
    fetch(`/api/story/${id}`)
      .then(res => res.json())
      .then(data => setStory(data))
      .catch(err => console.error("Error fetching story:", err));

    fetch('/api/user/me', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(user => {
        if (user) {
          setUserPoints(user.points || 0);
          setCurrentUserEmail(user.email);
          setCurrentUsername(user.username);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching user:", err);
        setLoading(false);
      });
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getWordCount = (text) => text.trim().split(/\s+/).filter(w => w.length > 0).length;

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    const authorTarget = story.authorEmail || story.author;
    if (currentUserEmail === authorTarget || currentUsername === authorTarget) {
      alert("You cannot review your own story to earn points.");
      return;
    }

    if (activeTier === 2 && getWordCount(formData.mediumAuthorChoice) < 75) {
      return alert("Level 2 requires at least 75 words.");
    }

    if (activeTier === 3) {
      const eWords = getWordCount(formData.longEnjoyed);
      const iWords = getWordCount(formData.longImprove);
      const total = getWordCount(formData.longTheme) + eWords + iWords + 
                    getWordCount(formData.longEnforceTheme) + getWordCount(formData.longWeight) + 
                    getWordCount(formData.longAdvice);

      if (total < 200) return alert(`Level 3 requires 200 words. You have ${total}.`);
      if (Math.abs(eWords - iWords) > 15) return alert("Enjoyed/Improvement sections must be within 15 words of each other.");
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          storyId: id,
          storyTitle: story.title,
          storyAuthorEmail: authorTarget,
          tier: activeTier,
          content: formData
        }),
      });

      if (response.ok) {
        alert(`Review submitted! Tier ${activeTier} points awarded.`);
        window.location.reload(); 
      } else {
        const errData = await response.json();
        alert(errData.msg || "Error submitting review.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // FLAG SUBMISSION LOGIC
  const handleFlagContent = async () => {
    if (!flagReason.trim()) return alert("Please provide a reason for flagging.");
    try {
      const response = await fetch('/api/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: 'story',
          targetId: id,
          targetTitle: story.title,
          reason: flagReason,
          content: story.content.substring(0, 500) + '...' // Snippet for admin
        }),
      });

      if (response.ok) {
        alert("Story has been flagged for admin review. Thank you for keeping Greyhound safe.");
        setShowFlagModal(false);
        setFlagReason('');
      } else {
        alert("Failed to submit flag.");
      }
    } catch (err) {
      console.error("Flag error:", err);
    }
  };

  if (loading) return <div style={{ color: '#C19A6B', textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

  const aspectOptions = ['Characters', 'Pacing', 'World-building', 'Dialogue', 'Prose', 'Plot Twist'];

  return (
    <div className="story-page-container">
      
      {/* FLAG MODAL */}
      {showFlagModal && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999}}>
          <div style={{background: '#2D1E17', padding: '30px', borderRadius: '8px', border: '1px solid #cc5555', width: '400px', fontFamily: "'Courier New', Courier, monospace"}}>
            <h3 style={{color: '#cc5555', marginTop: 0}}>🚩 Report this Story</h3>
            <p style={{color: '#F5EFE0', fontSize: '0.9rem', marginBottom: '15px'}}>Why does this violate the Greyhound Writing Pledge?</p>
            <textarea 
              value={flagReason} 
              onChange={(e) => setFlagReason(e.target.value)}
              rows="4" 
              placeholder="Reason for flagging (e.g. AI Generated, Offensive)..."
              style={{width: '100%', padding: '10px', background: '#1B1411', color: '#F5EFE0', border: '1px solid #C19A6B', marginBottom: '15px', fontFamily: 'inherit'}}
            />
            <div style={{display: 'flex', gap: '10px'}}>
              <button onClick={handleFlagContent} style={{flex: 2, background: '#cc5555', color: '#fff', border: 'none', padding: '10px', cursor: 'pointer', fontWeight: 'bold'}}>Submit Report</button>
              <button onClick={() => setShowFlagModal(false)} style={{flex: 1, background: 'none', color: '#8a7b70', border: '1px solid #8a7b70', cursor: 'pointer'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div id="storyInformation">
        <p><strong>Title:</strong> {story?.title}</p>
        <p><strong>Author:</strong> {story?.author}</p>
        <p><strong>Genre:</strong> {story?.genre || 'General'}</p>

        {/* THE FLAG BUTTON */}
        {currentUserEmail && (
          <button 
            onClick={() => setShowFlagModal(true)}
            className="flag-btn"
          >
            🚩 Flag Story
          </button>
        )}
      </div>

      <div id="fileContent">{story?.content}</div>

      <div id="reviews">
        <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: '#C19A6B' }}>Review & Earn Karma</p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', gap: '10px' }}>
          <button type="button" onClick={() => setActiveTier(1)} className={`tier-btn ${activeTier === 1 ? 'active' : ''}`} style={{ flex: 1, padding: '10px', background: activeTier === 1 ? '#C19A6B' : '#222', color: activeTier === 1 ? '#1B1411' : '#C19A6B', border: '2px solid #C19A6B', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Level 1 (1pt)
          </button>

          <button type="button" onClick={() => setActiveTier(2)} className={`tier-btn ${activeTier === 2 ? 'active' : ''}`} style={{ flex: 1, padding: '10px', background: activeTier === 2 ? '#C19A6B' : '#222', color: activeTier === 2 ? '#1B1411' : '#C19A6B', border: '2px solid #C19A6B', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Level 2 (3pts)
          </button>

          <button type="button" onClick={() => setActiveTier(3)} className={`tier-btn ${activeTier === 3 ? 'active' : ''}`} style={{ flex: 1, padding: '10px', background: activeTier === 3 ? '#C19A6B' : '#222', color: activeTier === 3 ? '#1B1411' : '#C19A6B', border: '2px solid #C19A6B', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Level 3 (5pts)
          </button>
        </div>

        <form onSubmit={handleSubmitReview}>
          {(activeTier === 1 || activeTier === 2) && (
            <>
              <div className="input-group">
                <label>What is one thing you enjoyed about reading this story?</label>
                <select name="shortEnjoyed" value={formData.shortEnjoyed} onChange={handleInputChange} required style={{width: '100%', padding: '8px', background: '#222', color: '#F5EFE0', border: '1px solid #C19A6B', marginBottom: '10px'}}>
                  <option value="">Select...</option>
                  {aspectOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>What is one thing the author could improve on to enrich their story?</label>
                <select name="shortImprove" value={formData.shortImprove} onChange={handleInputChange} required style={{width: '100%', padding: '8px', background: '#222', color: '#F5EFE0', border: '1px solid #C19A6B', marginBottom: '10px'}}>
                  <option value="">Select...</option>
                  {aspectOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label style={{marginBottom: '10px', display: 'block'}}>On a scale from 1-5 how was the:</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                  {[
                    { key: 'Dialogue', label: 'Dialogue?' },
                    { key: 'Detail', label: 'Use of Detail?' },
                    { key: 'Realism', label: 'Realism? (Or at least believability)' },
                    { key: 'Protagonist', label: 'Protagonist?' },
                    { key: 'Antagonist', label: 'Antagonist?' },
                    { key: 'Plot', label: 'Plot consistency? (How well it flows from one event to the next)' }
                  ].map(m => (
                    <div key={m.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <span style={{ fontSize: '0.9rem', flex: 1, marginRight: '10px' }}>{m.label}</span>
                      <input type="number" min="1" max="5" name={`scale${m.key}`} value={formData[`scale${m.key}`]} onChange={handleInputChange} required style={{ width: '40px', background: '#222', color: '#F5EFE0', border: '1px solid #C19A6B' }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="input-group" style={{ marginTop: '10px' }}>
                <label>Would you recommend this story to a friend? <span style={{marginLeft: '10px'}}><input type="radio" name="recommend" value="yes" onChange={handleInputChange} required /> Yes <input type="radio" name="recommend" value="no" onChange={handleInputChange} required /> No</span></label>
              </div>
              <div className="input-group" style={{ marginTop: '10px' }}>
                <label>In one word what would you guess is the theme?</label>
                <input type="text" name="shortTheme" value={formData.shortTheme} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', background: '#222', color: '#F5EFE0', border: '1px solid #C19A6B' }}/>
              </div>
            </>
          )}

          {activeTier === 2 && (
            <div className="input-group" style={{ marginTop: '20px', borderTop: '1px solid #C19A6B', paddingTop: '10px' }}>
              <label style={{ lineHeight: '1.4', marginBottom: '10px', display: 'block' }}>Point out one author choice in this story that intrigues you. You don’t have to support it or disagree, in fact you shouldn’t. But ask a question about this choice. Your objective isn’t to get an answer, it’s to get the writer to think about their story. Minimum 75 words.</label>
              <textarea name="mediumAuthorChoice" value={formData.mediumAuthorChoice} onChange={handleInputChange} required rows="4" placeholder={`Words: ${getWordCount(formData.mediumAuthorChoice)}`} />
            </div>
          )}

          {activeTier === 3 && (
            <>
              <p style={{ fontSize: '0.8rem', color: '#8a7b70' }}>Collective word count should be no less than 200 words. (Current: {getWordCount(formData.longTheme) + getWordCount(formData.longEnjoyed) + getWordCount(formData.longImprove) + getWordCount(formData.longEnforceTheme) + getWordCount(formData.longWeight) + getWordCount(formData.longAdvice)})</p>
              <div className="input-group"><label>In one sentence guess the theme of the story.</label><input type="text" name="longTheme" value={formData.longTheme} onChange={handleInputChange} required style={{ width: '100%', background: '#222', color: '#F5EFE0', border: '1px solid #C19A6B' }}/></div>
              <div className="input-group"><label>What is one thing you enjoyed about reading this story?</label><textarea name="longEnjoyed" value={formData.longEnjoyed} onChange={handleInputChange} required rows="2" /></div>
              <div className="input-group"><label>What is one thing the author could improve on to enrich their story? (this question and the one before it have to be within 15 words of each other in length) [Diff: {Math.abs(getWordCount(formData.longEnjoyed) - getWordCount(formData.longImprove))}]</label><textarea name="longImprove" value={formData.longImprove} onChange={handleInputChange} required rows="2" /></div>
              <div className="input-group"><label>How do you think the author could more fully enforce their theme?</label><textarea name="longEnforceTheme" value={formData.longEnforceTheme} onChange={handleInputChange} required rows="2" /></div>
              <div className="input-group"><label>What could the author do to put more weight and energy behind making the reader feel it?</label><textarea name="longWeight" value={formData.longWeight} onChange={handleInputChange} required rows="2" /></div>
              <div className="input-group"><label>Is there any other advice you have for this author?</label><textarea name="longAdvice" value={formData.longAdvice} onChange={handleInputChange} required rows="2" /></div>
            </>
          )}

          <input type="submit" value={isSubmitting ? "Sending..." : "Submit Review"} disabled={isSubmitting} style={{ marginTop: '15px' }} />
        </form>
      </div>

      <div id="advertisement">
        <p>Support Greyhound Writing!</p>
        <p style={{ fontSize: '0.8rem', color: '#8a7b70' }}>Goal: 1,000 words this month.</p>
      </div>
    </div>
  );
}