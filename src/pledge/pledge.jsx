import React from 'react';

const pledge = () => {
  const handleAccept = async (e) => {
    // 1. STOP the default form/button reload behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      const res = await fetch('/api/auth/accept-pledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (res.ok) {
        // 2. We use replace to overwrite the history so the "Back" button doesn't loop us
        // and we use the full URL to ensure a hard refresh of the user state
        window.location.replace('/authorAccountPage');
      } else {
        alert("There was an error saving your pledge. Please try again.");
      }
    } catch (err) {
      console.error("pledge error:", err);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', color: 'white', backgroundColor: '#1a1a1a', borderRadius: '10px', border: '1px solid #00ff88', lineHeight: '1.6' }}>
      <h2 style={{ color: '#00ff88', textAlign: 'center' }}>The Greyhound Writing Pledge</h2>
      <p style={{ fontStyle: 'italic', color: '#aaa' }}>Read the following passage aloud. It can be in a quiet room by yourself or in front of a witness if you’d like.</p>
      
      <blockquote style={{ borderLeft: '4px solid #00ff88', paddingLeft: '20px', margin: '20px 0', fontSize: '1.1rem' }}>
        "I pledge, as a writer, to do my best to write quality content. To be honest in my writing and not use AI. 
        My writing will foster a sense of safety, not be offensive to any culture, and won’t promote any ideological belief. 
        I will be respectful, considerate, and constructive when I respond to others’ writing. I will do so with the intention of helping them improve.
        This is not social media. I will not treat it like social media. I will not treat this as a battleground for my beliefs, but as a platform to practice my skills. 
        I will not treat this as a place to get attention and followers, but build others’ writing and skills up.
        This is a community for beginning writers to grow."
      </blockquote>

      <p>The mission of Greyhound is to increase the talent of its members. It will do so by creating a community of writers who will support and assist each other in their efforts.</p>
      
      <p style={{ fontWeight: 'bold', color: '#00ff88' }}>You’re joining Greyhound. You’re a part of this. Live it.</p>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        {/* Changed to type="button" to be 100% sure it doesn't trigger a form submit */}
        <button 
          type="button"
          onClick={handleAccept}
          style={{ backgroundColor: '#00ff88', color: 'black', border: 'none', padding: '15px 30px', fontSize: '1.1rem', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          I have read and I accept this pledge
        </button>
      </div>
    </div>
  );
};

export default pledge;