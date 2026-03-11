import React from 'react';

const TermsAndConditions = () => {
  const handleAccept = async (e) => {
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
        window.location.replace('/authorAccountPage');
      } else {
        alert("There was an error saving your acceptance. Please try again.");
      }
    } catch (err) {
      console.error("pledge error:", err);
    }
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '40px auto', 
      padding: '40px', 
      color: '#F5EFE0', 
      backgroundColor: '#1B1411', 
      borderRadius: '8px', 
      border: '1px solid #C19A6B', 
      lineHeight: '1.8', 
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)', 
      fontFamily: "'Courier New', Courier, monospace" 
    }}>
      <h2 style={{ color: '#C19A6B', textAlign: 'center', marginBottom: '30px', letterSpacing: '1px' }}>Terms and Conditions</h2>
      
      {/* TERMS TEMPLATE SECTION */}
      <div style={{ marginBottom: '40px', borderBottom: '1px solid #3e2b22', paddingBottom: '20px' }}>
        <h3 style={{ color: '#C19A6B' }}>1. Introduction</h3>
        <p>[Insert introduction regarding the agreement to terms...]</p>

        <h3 style={{ color: '#C19A6B' }}>2. User Conduct</h3>
        <p>[Insert rules about user behavior, harassment, etc...]</p>

        <h3 style={{ color: '#C19A6B' }}>3. Content Ownership</h3>
        <p>[Insert details about who owns the stories uploaded...]</p>

        <h3 style={{ color: '#C19A6B' }}>4. Termination</h3>
        <p>[Insert conditions under which an account may be terminated...]</p>
      </div>
      
      {/* REFERENCE SECTION (Old Pledge) */}
      <div style={{ opacity: 0.7, border: '1px dashed #555', padding: '20px', marginBottom: '30px' }}>
        <h4 style={{ marginTop: 0, color: '#8a7b70' }}>Reference: Old Pledge Content</h4>
        <p style={{ fontStyle: 'italic', color: '#8a7b70', textAlign: 'center', marginBottom: '10px' }}>
          Read the following passage aloud. It can be in a quiet room by yourself or in front of a witness if you’d like.
        </p>
        <blockquote style={{ borderLeft: '4px solid #C19A6B', paddingLeft: '30px', margin: '20px 0', fontSize: '1rem', fontStyle: 'italic', color: '#dcd6c8' }}>
          "I pledge, as a writer, to do my best to write quality content. To be honest in my writing and not use AI. 
          My writing will foster a sense of safety, not be offensive to any culture, and won’t promote any ideological belief. 
          I will be respectful, considerate, and constructive when I respond to others’ writing. I will do so with the intention of helping them improve.
          This is not social media. I will not treat it like social media. I will not treat this as a battleground for my beliefs, but as a platform to practice my skills. 
          I will not treat this as a place to get attention and followers, but build others’ writing and skills up.
          This is a community for beginning writers to grow."
        </blockquote>

        <p style={{ marginBottom: '10px', fontSize: '0.9rem' }}>The mission of Greyhound is to increase the talent of its members. It will do so by creating a community of writers who will support and assist each other in their efforts.</p>
        <p style={{ fontWeight: 'bold', color: '#C19A6B', textAlign: 'center', fontSize: '1rem' }}>You’re joining Greyhound. You’re a part of this. Live it.</p>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button 
          type="button"
          onClick={handleAccept}
          style={{ 
            backgroundColor: '#C19A6B', 
            color: '#1B1411', 
            border: 'none', 
            padding: '15px 40px', 
            fontSize: '1.1rem', 
            borderRadius: '4px', 
            cursor: 'pointer', 
            fontWeight: 'bold',
            fontFamily: "'Courier New', Courier, monospace",
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#a8855b'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#C19A6B'}
        >
          I accept the Terms and Conditions
        </button>
      </div>
    </div>
  );
};

export default TermsAndConditions;