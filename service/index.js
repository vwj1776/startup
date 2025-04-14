require('dotenv').config();

const connectToDatabase = require('./db');
connectToDatabase();

const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const path = require('path');
const app = express();

const User = require('../models/User');
const Story = require('../models/Story');
const Review = require('../models/Review');

const authCookieName = 'token';
const port = process.argv.length > 2 ? process.argv[2] : 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// API router
const apiRouter = express.Router();
app.use('/api', apiRouter);

// Create a new user
apiRouter.post('/auth/create', async (req, res) => {
  if (await User.findOne({ email: req.body.email })) {
    return res.status(409).json({ msg: 'Existing user' });
  }

  const passwordHash = await bcrypt.hash(req.body.password, 10);
  const user = new User({
    email: req.body.email,
    password: passwordHash,
    token: uuid.v4(),
  });

  await user.save();
  setAuthCookie(res, user.token);
  res.send({ email: user.email });
});

// Login user
apiRouter.post('/auth/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user && await bcrypt.compare(req.body.password, user.password)) {
    user.token = uuid.v4();
    await user.save();
    setAuthCookie(res, user.token);
    res.send({ email: user.email });
  } else {
    res.status(401).json({ msg: 'Unauthorized' });
  }
});

// Logout user
apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await User.findOne({ token: req.cookies[authCookieName] });
  if (user) {
    user.token = null;
    await user.save();
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// Auth middleware
const verifyAuth = async (req, res, next) => {
  const user = await User.findOne({ token: req.cookies[authCookieName] });
  if (user) {
    req.user = user;
    next();
  } else {
    res.status(401).json({ msg: 'Unauthorized' });
  }
};

// Get all stories
apiRouter.get('/stories', verifyAuth, async (_req, res) => {
  const stories = await Story.find({});
  res.send(stories);
});

// Upload a new story
apiRouter.post('/upload', verifyAuth, async (req, res) => {
  const { content, filename } = req.body;
  if (!content || !filename) {
    return res.status(400).json({ msg: 'Missing file content or filename' });
  }

  const story = new Story({
    title: filename.replace('.txt', ''),
    content,
    author: req.user.email,
    createdAt: new Date(),
  });

  await story.save();
  res.status(201).json({ msg: 'Upload successful', story });
});

// Delete a story
apiRouter.delete('/story/:id', verifyAuth, async (req, res) => {
  const result = await Story.findByIdAndDelete(req.params.id);
  if (result) {
    res.status(204).end();
  } else {
    res.status(404).json({ msg: 'Story not found' });
  }
});

// Get reviews for a story
apiRouter.get('/reviews', verifyAuth, async (req, res) => {
  const { storyId } = req.query;
  if (!storyId) {
    return res.status(400).json({ msg: 'Missing storyId in query' });
  }

  const reviews = await Review.find({ storyId });
  res.send(reviews);
});

// Submit a review
apiRouter.post('/review', verifyAuth, async (req, res) => {
  const { storyId, content } = req.body;
  if (!storyId || !content) {
    return res.status(400).json({ msg: 'Missing storyId or content' });
  }

  const newReview = new Review({
    storyId,
    content,
    author: req.user.email,
    createdAt: new Date(),
  });

  await newReview.save();
  await newReview.save();
  broadcastReview(newReview); // ✅ notify all clients
  res.status(201).json({ msg: 'Review saved', review: newReview });
});

// Cookie helper
function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

// Fallback route
// app.get('*', (_req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ type: err.name, message: err.message });
});

// Start server
// app.listen(port, () => {
//   console.log(`🚀 Listening on port ${port}`);
// });

const http = require('http');
const WebSocket = require('ws');

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = [];

wss.on('connection', (ws) => {
  clients.push(ws);
  ws.on('close', () => {
    const index = clients.indexOf(ws);
    if (index !== -1) clients.splice(index, 1);
  });
});

function broadcastReview(review) {
  const message = JSON.stringify({ type: 'newReview', data: review });
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

server.listen(port, () => {
  console.log(`🚀 Server + WebSocket listening on port ${port}`);
});

