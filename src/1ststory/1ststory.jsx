import React, { useState, useEffect } from 'react';
import './1ststory.css';

export default function FirstStory() {
  const [messages, setMessages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [storyContent, setStoryContent] = useState('Loading story content...');

  useEffect(() => {
    fetch('story2.txt')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(data => {
        setStoryContent(data);
      })
      .catch(error => {
        setStoryContent('Error loading file: ' + error.message);
      });
  }, []);

  const handleAuthorMessageSubmit = (event) => {
    event.preventDefault();
    const message = event.target.authorMessage.value.trim();
    if (message) {
      setMessages([...messages, message]);
      console.log('Messages list:', [...messages, message]);
      event.target.reset();
    }
  };

  const handleReviewSubmit = (event) => {
    event.preventDefault();
    const review = event.target.newReview.value.trim();
    if (review) {
      setReviews([...reviews, review]);
      event.target.reset();
    }
  };

  return (
    <div>
      <nav>
        <a href="authorAccount.html" target="_blank">
          <div>
            <p>Upload Stories here</p>
          </div>
        </a>
        <a href="demo.html" target="_blank">
          <div>
            <p>demo page turn</p>
          </div>
        </a>
        <a href="index.html" target="_blank">
          Login
        </a>
        <div id="authorIcon">
          <p>&lt; Author Account Name &gt;</p>
          <img src="monkey.png" alt="no profile picture found" />
        </div>
        <a href="manyStories.html" target="_blank">
          <p>Many Stories</p>
        </a>
      </nav>

      <div id="storyInformation">
        <p>
          <strong>Author Info:</strong>
          <br />
          Name
          <br />
          Picture of Story
          <br />
          <strong>Other Stories by the Same Author:</strong>
          <br />
          1
          <br />
          2
          <br />
          3
        </p>
      </div>

      <div id="messageAuthor">
        <form id="authorForm" onSubmit={handleAuthorMessageSubmit}>
          <label htmlFor="authorMessage">Message the Author:</label>
          <input type="text" id="authorMessage" name="authorMessage" placeholder="Type your message here" />
          <input type="submit" value="Send" />
        </form>
      </div>

      <div id="advertisement">
        <p>Advertisement Placeholder</p>
      </div>

      <div id="fileContent" className="scrollable-div">{storyContent}</div>

      <div id="reviews">
        <p><strong>Leave a Review:</strong></p>
        <form id="reviewForm" onSubmit={handleReviewSubmit}>
          <label htmlFor="newReview">Your Review:</label>
          <textarea id="newReview" name="newReview" placeholder="Write your review here" rows="4" cols="50"></textarea>
          <br />
          <input type="submit" value="Submit" />
        </form>

        <div id="reviewList" style={{ overflowY: 'auto', maxHeight: '100px', border: '1px solid #ccc' }}>
          {reviews.map((review, index) => (
            <p key={index}>{review}</p>
          ))}
        </div>
      </div>
    </div>
  );
}