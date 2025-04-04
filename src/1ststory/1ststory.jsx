import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './1ststory.css';
import text from '../../public/story1.txt';
export default function FirstStory() {
  const [messages, setMessages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [storyContent, setStoryContent] = useState(text);
  const ws = useRef(null);

  useEffect(() => {
    axios.get('../public/1ststory.txt')
      .then(response => {
        console.log('Response:', response);
        setStoryContent(response.data);
      })
      .catch(error => {
        console.error('Error fetching the file:', error);
        setStoryContent('Error loading file: ' + error.message);
      });

    // Initialize WebSocket connection
    ws.current = new WebSocket('ws://localhost:8080');

    ws.current.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.current.onmessage = (event) => {
      const messageData = JSON.parse(event.data);

      if (messageData.type === 'initial') {
        // Load initial messages
        setMessages(messageData.data);
      } else if (messageData.type === 'new') {
        // Add new message to the list
        setMessages((prevMessages) => [...prevMessages, messageData.data]);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.current.close();
    };
  }, []);

  const handleAuthorMessageSubmit = (event) => {
    event.preventDefault();
    const message = event.target.authorMessage.value.trim();
    if (message) {
      ws.current.send(JSON.stringify({ type: 'new', data: message }));
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

      <div id="fileContent" className="scrollable-div">{storyContent}</div>
      <div id="reviews">
        <p><strong>Leave a Review:</strong></p>
        <form id="reviewForm" onSubmit={handleReviewSubmit}>
          <label htmlFor="newReview">Your Review:</label>
          <textarea id="newReview" name="newReview" placeholder="Write your review here" rows="4" cols="50"></textarea>
          <br />
          <input type="submit" value="Submit" />
        </form>

        <div id="reviewList" className="scrollable-div">
          {reviews.map((review, index) => (
            <p key={index}>{review}</p>
          ))}
          
        </div>
      </div>
    </div>
  );
}