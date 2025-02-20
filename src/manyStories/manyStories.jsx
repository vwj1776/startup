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



      <div id="introduction">
        <p>Greyhound Writing2 is a platform for you to sell and buy stories online. Stories are mainly written by youth, so by buying these stories you are supporting the rising generation of our world’s next authors.</p>
      </div>

      <main>
        <div id="allstories" className="container">
          {stories.map((story, index) => (
            <a href={story.link} target="_blank" key={index} className="highlighted-link">
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