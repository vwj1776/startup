import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthorInfo() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '30px', background: '#1B1411', color: '#F5EFE0', borderRadius: '8px', border: '1px solid #C19A6B', fontFamily: "'Courier New', Courier, monospace" }}>
      <h2 style={{ color: '#C19A6B', textAlign: 'center', marginBottom: '25px' }}>Author Information</h2>
      
      <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#8a7b70' }}>
        This page is under construction. Here you will be able to view and edit your public author profile.
      </p>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button onClick={() => navigate('/authorAccountPage')} style={{ background: 'none', border: '1px solid #C19A6B', color: '#C19A6B', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'inherit' }}>
          Back to Account
        </button>
      </div>
    </div>
  );
}