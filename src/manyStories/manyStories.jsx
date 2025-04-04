import React from 'react';
import './manyStories.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';




export default function ManyStories() {
    const stories = [
        { title: "Title of the story", gist: "gist of the story....", length: "#pgs", author: "so-and-so", link: "/FirstStory" },
        { title: "Title of the story", gist: "gist of the story....", length: "#pgs", author: "so-and-so", link: "/FirstStory" },
        { title: "Title of the story", gist: "gist of the story....", length: "#pgs", author: "so-and-so", link: "/FirstStory" },
      ];



  return (
    <div>
      <div id="introduction">
        <p>Greyhound Writing is a platform for you to sell and buy stories online. Stories are mainly written by youth, so by buying these stories you are supporting the rising generation of our world’s next authors.</p>
      </div>

      <main>
        <div id="allstories" className="container">
          {stories.map((story, index) => (
            <NavLink to={story.link} key={index} className="highlighted-link">
              <div className="stories">
                <p className="title">{story.title}</p>
                <p>{story.gist}</p>
                <p>length: {story.length}</p>
                <p>Author(written by): {story.author}</p>
              </div>
              </NavLink>
          ))}
        </div>
      </main>

      <footer>
        <p>Do you want to sell your stories on this website? Email me at Gavin.Jones.Greyhound@gmail.com</p>
      </footer>
    </div>
  );
}