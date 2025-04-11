import React from 'react';

import { useEffect, useState } from 'react';

export default function JokeBanner() {
  const [joke, setJoke] = useState(null);

  useEffect(() => {
    fetch('https://v2.jokeapi.dev/joke/Programming?type=single&safe-mode')
      .then((res) => res.json())
      .then((data) => setJoke(data.joke));
  }, []);

  return (
    <div className="joke-banner">
      {joke ? <p>💻 {joke}</p> : <p>Loading joke...</p>}
    </div>
  );
}
