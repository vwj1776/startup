import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './1ststory.css';

export default function FirstStory() {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/stories', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((s) => s.id === id);
        if (found) {
          setStory(found);
        } else {
          setError('Story not found.');
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Error fetching story.');
      });
  }, [id]);

  const handleReviewSubmit = (event) => {
    event.preventDefault();
    const review = event.target.newReview.value.trim();
    if (review) {
      setReviews([...reviews, review]);
      event.target.reset();
    }
  };

  if (error) return <p>{error}</p>;
  if (!story) return <p>Loading story...</p>;

  return (
    <div>
      <div id="storyInformation">
        <p>
          <strong>Title:</strong> {story.title}<br />
          <strong>Author:</strong> {story.author}<br />
          <strong>Date:</strong> {new Date(story.createdAt).toLocaleString()}
        </p>
      </div>

      <div id="fileContent" className="scrollable-div">
        <pre>{story.content}</pre>
      </div>

      <div id="reviews">
        <p><strong>Leave a Review:</strong></p>
        <form id="reviewForm" onSubmit={handleReviewSubmit}>
          <label htmlFor="newReview">Your Review:</label>
          <textarea id="newReview" name="newReview" placeholder="Write your review here" rows="4" cols="50"></textarea>
          <br />
          <input type="submit" value="Submit" />
        </form>

        <div id="reviewList" className="scrollable-div">
          {reviews.length === 0 ? (
            <p>No reviews yet.</p>
          ) : (
            reviews.map((review, index) => (
              <p key={index}>{review}</p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
