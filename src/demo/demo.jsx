import React from "react";
import "./demo.css";

const Demo = () => {

  console.log("Demo component loaded");


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

        <a href="index.html" target="_blank">Login</a>

        <div id="authorIcon">
          <p>&lt; Author Account Name &gt;</p>
          <img src="monkey.png" alt="no profile picture found" />
        </div>

        <a href="manyStories.html" target="_blank">
          <p>Many Stories</p>
        </a>
      </nav>

      <div id="all">
        <div id="page-flip">
          <div id="r1">
            <div id="p1">
              <div>
                <div></div>
              </div>
            </div>
          </div>
          <div id="p2">
            <div></div>
          </div>
          <div id="r3">
            <div id="p3">
              <div>
                <div></div>
              </div>
            </div>
          </div>
          <div className="s">
            <div id="s3">
              <div id="sp3"></div>
            </div>
          </div>
          <div className="s" id="s4">
            <div id="s2">
              <div id="sp2"></div>
            </div>
          </div>
          <a id="coke" href="#" title="Pure CSS Coke Can"></a>
          <a id="meninas" href="#" title="CSS 3D Meninas"></a>
        </div>
      </div>
    </div>
  );
};

export default Demo;
