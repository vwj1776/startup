import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TermsOfService from '../TermsOfService';

export default function AuthorInfo() {
  const navigate = useNavigate();
  const [referrerEmail, setReferrerEmail] = useState('');
  const [creditStatus, setCreditStatus] = useState('');

  const handleCreditSubmit = async () => {
    if (!referrerEmail.trim()) {
      setCreditStatus("Please enter an email.");
      return;
    }
    try {
      const response = await fetch('/api/user/credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ referrerEmail })
      });
      const data = await response.json();
      if (response.ok) {
        setCreditStatus("Success! You've both been awarded points.");
        setReferrerEmail('');
      } else {
        setCreditStatus(`Error: ${data.msg}`);
      }
    } catch (err) {
      setCreditStatus("Error applying credit.");
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '30px', background: '#1B1411', color: '#F5EFE0', borderRadius: '8px', border: '1px solid #C19A6B', fontFamily: "'Courier New', Courier, monospace" }}>
      <h2 style={{ color: '#C19A6B', textAlign: 'center', marginBottom: '25px' }}>Author Information</h2>
      
      <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>Dear Author!</p>

      <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
        There’s a lot going on in this website so this will be a helpful guide to help you understand all the amazing resources we have to help you be a better writer.
      </p>
<h2>Our Purpose</h2>
      <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
        First off, the purpose of Greyhound is to help you improve your skills. Yes there’s some ways for us to make money off of you but everything about this free version is designed to help your skills improve, and get your name out there as a beginning writer; towards building your following, talent, and connection to the market. 
      </p>
<h2>How to Game The Algorithm</h2>
      <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
        To get something out of this, you need to put something into it. The way our story recommending algorithm works is by recommending stories from authors that interact more with others stories. Your stories get recommended more the more you comment on other’s stories. The idea is for you to help others with pointers on how to become better writers, then they will see your stories more and they are more likely to give you feedback that will make you a better writer. It’s a win-win.
      </p>

      <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
        There’s another way to get even more points so your stories show up even more often. We have a program where if you recommend Greyhound to others and they publish on here you can get more views. If you recommend that your friends or family publish on Greyhound, and they create an account and publish stories on that account, your stories will be more likely to be recommended by the algorithm.
      </p>

      <div style={{ background: '#2D1E17', padding: '15px', borderRadius: '8px', border: '1px solid #C19A6B', marginBottom: '20px' }}>
        <h3 style={{ color: '#F5EFE0', marginTop: 0 }}>Credit Your Referrer</h3>
        <p style={{ fontSize: '0.9rem', color: '#8a7b70', marginBottom: '15px' }}>Did someone recommend Greyhound to you? Credit them below! They will receive 15 points, and you will receive 1 point.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <input 
            type="email" 
            placeholder="Referrer's Email" 
            value={referrerEmail} 
            onChange={(e) => setReferrerEmail(e.target.value)} 
            style={{ flex: 1, minWidth: '250px', padding: '12px', fontSize: '1rem', background: '#1B1411', color: '#F5EFE0', border: '1px solid #C19A6B', borderRadius: '4px', fontFamily: 'inherit' }}
          />
          <button onClick={handleCreditSubmit} style={{ background: '#C19A6B', color: '#1B1411', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'inherit' }}>
            Credit Author
          </button>
        </div>
        {creditStatus && <p style={{ marginTop: '10px', color: creditStatus.includes('Error') ? '#cc5555' : '#4CAF50', fontSize: '0.9rem', fontWeight: 'bold' }}>{creditStatus}</p>}
      </div>

<h2>Curriculums to Help You Improve Your Work</h2>
      <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
        There’s also many curriculums and programs here to help you achieve your writing goals. The first curriculum is free, (and completing it also helps your stories with the algorithm) while everything else raises money. These curriculums and programs can help you learn more about what goes into writing, making an engaging story, or programs that outline processes in your goals, for example, like writing a book and how to do that in a year. Unlock your full writing potential as you use these programs.
      </p>
<h2>We Want Feedback!</h2>
      <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
        Finally is you have any questions, concerns, comments, feedback, ideas, or literally anything you want us to know tell us all about it at <a href="mailto:Gavin.Jones.Greyhound@gmail.com" style={{ color: '#C19A6B' }}>Gavin.Jones.Greyhound@gmail.com</a>
      </p>

      <h2 style={{ marginTop: '30px', textAlign: 'left' }}>Terms of Service</h2>
      <TermsOfService />

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button onClick={() => navigate('/authorAccountPage')} style={{ background: 'none', border: '1px solid #C19A6B', color: '#C19A6B', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'inherit' }}>
          Back to Account
        </button>
      </div>
    </div>
  );
}