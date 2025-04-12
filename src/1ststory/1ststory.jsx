import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // ✅ Step 1: import useParams
import './1ststory.css';

export default function FirstStory() {
  const { id } = useParams(); // ✅ Step 2: get `id` from URL
  const [story, setStory] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('Story ID from URL:', id); // ✅ Step 3: optional debug
    fetch('/api/stories', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((s) => s._id === id); // ✅ match MongoDB's _id
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
  
  useEffect(() => {
    if (!story?._id) return; // wait until story is set
  
    fetch(`/api/reviews?storyId=${story._id}`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((err) => console.error('Error loading reviews:', err));
  }, [story]); // 🔁 depends on `story`
  
  

  const handleReviewSubmit = (event) => {
    event.preventDefault();
    const review = event.target.newReview.value.trim();
  
    if (review) {
      console.log('Submitting review:', { content: review, storyId: id }); // 🧪 DEBUG
  
      fetch('/api/review', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: review, storyId: id }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to submit review');
          return res.json();
        })
        .then((data) => {
          setReviews((prev) => [...prev, data.review]);
          event.target.reset();
        })
        .catch((err) => console.error('Error submitting review:', err));
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
        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{story.content}</pre>
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
            reviews.map((review, index) => {
              if (!review || !review.author || !review.content) return null;
            
              return (
                <div key={index} className="review">
                  <p><strong>{review.author}</strong> wrote:</p>
                  <p>{review.content}</p>
                  <small>{new Date(review.createdAt).toLocaleString()}</small>
                </div>
              );
            })            
          )}
        </div>
      </div>
    </div>
  );
}
