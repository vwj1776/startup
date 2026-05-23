import React, { useState } from 'react';

export default function TermsOfService() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ marginBottom: '20px', fontFamily: "'Courier New', Courier, monospace" }}>
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: '1px solid #C19A6B',
          color: '#C19A6B',
          padding: '10px 20px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        Terms of Service {isOpen ? '▲' : '▼'}
      </button>

      {isOpen && (
        <div style={{
          marginTop: '10px',
          padding: '20px',
          background: '#2D1E17',
          border: '1px solid #C19A6B',
          borderRadius: '8px',
          color: '#F5EFE0',
          maxHeight: '400px',
          overflowY: 'auto',
          lineHeight: '1.6',
          fontSize: '0.9rem'
        }}>
          <h3 style={{ color: '#C19A6B', marginTop: 0 }}>The Most Important Rule: Try Your Best</h3>
          <p>
            Put everything into your writing. Do your best to write good stories and books, and do your best when you review other’s writing in giving them feedback that will help them hone their skills and their stories. We all want to achieve big goals here, and you would be surprised at what you can do if you give it everything you’ve got. And improving your writing skills as much as possible is your primary concern, the rest of these should come simply.
          </p>

          <h3 style={{ color: '#C19A6B' }}>No AI</h3>
          <p>
            The use of AI in today’s society is very real, and isn’t going away anytime soon. But for you to continually be allowed to publish on this site, you must resist and restrain yourself from using AI in any way for any of your work. If your work is found to use AI, it will be taken down from the site and your account could potentially be banned. To clarify, this is any of the stories you publish or the responses you fill out for yours or others stories.
          </p>
          <p>
            Also you’ll find there’s not much motivation to fake your stories. The purpose of Greyhound is to improve your writing skills. If you have better stories because AI made them for you, the feedback you’re getting is useless. AI doesn’t need feedback, it can’t change its writing style. More views and more feedback are only helpful if you’re sincerely interested in improving your writing skills: food for thought.
          </p>

          <h3 style={{ color: '#C19A6B' }}>Contentious Writing</h3>
          <p>
            This is a safe place. We will not tolerate any writing(stories published and responses) that threatens, demeans, or is attempting to hurt, defame, or libelise any religion, culture, or belief. 
          </p>
          <p>
            If you have a political statement, put it on social media. Don’t put it on our site. We reserve the right to take your statements and accounts down for any reason. Using this site for what it’s intended - improving yours and others writing skills - will get you much further than if you try and cause problems.
          </p>
          <p>
            So to be clear, we reserve the right to cancel your account and therefore delete any of the content you put on our website. But doing these things are a good guideline to prevent that from happening to you.
          </p>
          <ul style={{ paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>Be kind and civilized</li>
            <li style={{ marginBottom: '8px' }}>Avoid excessive or unhelpful contention in comments or stories.</li>
            <li style={{ marginBottom: '8px' }}>Completely refrain from posting political and ideological statements.</li>
            <li style={{ marginBottom: '8px' }}>Avoid Spamming, or posting content for the specific purpose of irritating others. No trolling.</li>
            <li style={{ marginBottom: '8px' }}>Make a positive environment. If it’s hurting our business or course we’re going to ban it, so at least have some consideration for whether or not it’s going to hurt our business.</li>
            <li style={{ marginBottom: '8px' }}>Don’t break that law. Don’t steal other’s work or anything copyrighted.</li>
          </ul>

          <h3 style={{ color: '#C19A6B' }}>Your Information</h3>
          <p>
            When you actively upload or actively give our website any information, (such as your Username and email, stories, responses, any text box you fill out, or any button you push) we reserve the right to do anything with that information. We will never publicise anything intentionally defamatory to your name or work, and if we publicise your work, we will include your name(username) attached.
          </p>
          <p>
            But when you upload stories to our website, they are made public on our site and attached to your username.<br />
            But what we will probably do with your stories includes, but is not limited to the following:
          </p>
          <ul style={{ paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>Making a podcast episode, or multiple episodes where we read your story and dissect the meaning and techniques used in it.</li>
            <li style={{ marginBottom: '8px' }}>Highlighting your story on the website or our social media channels to highlight the amazing things happening at our website.</li>
          </ul>
          <p>
            We only use cookies to make the site function for you. We don’t do anything else with them.
          </p>
          
          <p style={{ marginTop: '20px', fontWeight: 'bold' }}>
            If you have questions, concerns, or anything to say, contact <a href="mailto:Gavin.Jones.Greyhound@gmail.com" style={{ color: '#C19A6B' }}>Gavin.Jones.Greyhound@gmail.com</a>
          </p>
        </div>
      )}
    </div>
  );
}