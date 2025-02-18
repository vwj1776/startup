import React from 'react';
import './manyStories.css';



export default function ManyStories() {
    const stories = [
        { title: "Title of the story", gist: "gist of the story....", length: "#pgs", author: "so-and-so", price: "#.##", link: "1ststory.html" },
        { title: "Title of the story", gist: "gist of the story....", length: "#pgs", author: "so-and-so", price: "#.##", link: "1ststory.html" },
        { title: "Title of the story", gist: "gist of the story....", length: "#pgs", author: "so-and-so", price: "#.##", link: "1ststory.html" },
        { title: "Title of the story", gist: "gist of the story....", length: "#pgs", author: "so-and-so", price: "#.##", link: "1ststory.html" },
        { title: "Title of the story", gist: "gist of the story....", length: "#pgs", author: "so-and-so", price: "#.##", link: "1ststory.html" },
        { title: "Title of the story", gist: "gist of the story....", length: "#pgs", author: "so-and-so", price: "#.##", link: "1ststory.html" },
        { title: "Title of the story", gist: "gist of the story....", length: "#pgs", author: "so-and-so", price: "#.##", link: "1ststory.html" },
        { title: "Title of the story", gist: "gist of the story....", length: "#pgs", author: "so-and-so", price: "#.##", link: "1ststory.html" },
        { title: "Title of the story", gist: "gist of the story....", length: "#pgs", author: "so-and-so", price: "#.##", link: "1ststory.html" },
        { title: "Title of the story", gist: "gist of the story....", length: "#pgs", author: "so-and-so", price: "#.##", link: "1ststory.html" }
      ];



  return (
    <div>
      <header>
        <img src="writing logo.png" alt="Writing Logo" />
      </header>

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

      <div id="introduction">
        <p>Greyhound Writing2 is a platform for you to sell and buy stories online. Stories are mainly written by youth, so by buying these stories you are supporting the rising generation of our world’s next authors.</p>
      </div>

      <main>
        <div id="allstories" className="container">
          {stories.map((story, index) => (
            <a href={story.link} target="_blank" key={index}>
              <div className="stories">
                <p className="title">{story.title}</p>
                <p>{story.gist}</p>
                <p>length: {story.length}</p>
                <p>Author(written by): {story.author}</p>
                <p className="buybutton">Buy for ${story.price}</p>
              </div>
            </a>
          ))}
        </div>
      </main>

      <footer>
        <p>Do you want to sell your stories on this website? Email me at Gavin.Jones.Greyhound@gmail.com</p>
      </footer>
    </div>
  );
}