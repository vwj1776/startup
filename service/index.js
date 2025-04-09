const express = require('express');

const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Generic GET endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello, world!' });
});

// Generic POST endpoint
app.post('/api/echo', (req, res) => {
  const data = req.body;
  res.json({ received: data });
});

// Start the server
app.listen(port, () => {
  console.log(`Service is running at http://localhost:${port}`);
});