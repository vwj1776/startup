import React from 'react';
import './Curriculum.css'; 

export default function Curriculum() {
  return (
    <div id="bodyCurriculum">
      <div className="curriculum-header">
        <h1>Curriculum</h1>
        <p>You can read stories on Greyhound, but you can't publish any stories or interact with the community until you finish this brief curriculum with a score of 100%.</p>
        <p>Make a copy of each document and use them to answer the quizzes.</p>
        <p>Ensure your quiz email matches your Greyhound account email so we can grant you access.</p>
      </div>

      <div className="curriculum-container">
        {/* Unit 1 */}
        <div className="unit-group">
          <a href="https://docs.google.com/document/d/16v13GsJMBEXk15E9zrpUWmljoGlkXh-CiFCPfNYC6N4/edit" className="unit-btn" target="_blank" rel="noreferrer">Unit 1: Get Ideas</a>
          <a href="https://forms.gle/Dr39BXFmfzTZfMcm8" className="quiz-btn" target="_blank" rel="noreferrer">Unit 1 Quiz</a>
        </div>

        {/* Unit 2 */}
        <div className="unit-group">
          <a href="https://docs.google.com/document/d/1q48JEHdw5LWlO2CjPy33OBJnRJnzbVRHdPSIXkZdoco/edit" className="unit-btn" target="_blank" rel="noreferrer">Unit 2: Basic Writing Skills</a>
          <a href="https://forms.gle/SrgbMpsLg25mtXuu9" className="quiz-btn" target="_blank" rel="noreferrer">Unit 2 Quiz</a>
        </div>

        {/* Unit 3 */}
        <div className="unit-group">
          <a href="https://docs.google.com/document/d/1LwE4Pl7oLcZJSxBDlj59boOmY3TT7dX4s9iElRn5MeI/edit" className="unit-btn" target="_blank" rel="noreferrer">Unit 3: Commenting and Editing</a>
          <a href="https://forms.gle/659ZQrqTMNtiyaH66" className="quiz-btn" target="_blank" rel="noreferrer">Unit 3 Quiz</a>
        </div>

        {/* Unit 4 */}
        <div className="unit-group">
          <a href="https://docs.google.com/document/d/1g9Vel0_cjrKgZct4rrP-DWpPqzQZF-cfV2S8ckZUf7k/edit" className="unit-btn" target="_blank" rel="noreferrer">Unit 4: How to get More Out of Your Writing</a>
          <a href="https://forms.gle/SAVxtfaXyYqAD6V2A" className="quiz-btn" target="_blank" rel="noreferrer">Unit 4 Quiz</a>
        </div>

        {/* Unit 5 */}
        <div className="unit-group">
          <a href="https://docs.google.com/document/d/1oUKjaXfjca7M5jjcyMsQH7iZvKEX8TbmP4qE_tSJjf0/edit" className="unit-btn" target="_blank" rel="noreferrer">Unit 5: Writing as an Art</a>
          <a href="https://forms.gle/W8acq7TzYi6V771C7" className="quiz-btn" target="_blank" rel="noreferrer">Unit 5 Quiz</a>
        </div>
      </div>
    </div>
  );
}