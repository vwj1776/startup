import React from "react";
import "./demo.css";

const Demo = () => {

  console.log("Demo component loaded");


  return (
    <div>


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
