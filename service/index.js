// Refactored version using native MongoDB client instead of Mongoose
const { connectToDatabase, getCollections } = require('./db');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const path = require('path');

const WebSocket = require('ws');

const app = express();
const authCookieName = 'token';
console.log('this is just a test for git');
const port = process.argv.length > 2 ? process.argv[2] : 4000;

let User, Story, Review;

(async () => {
  await connectToDatabase();
  ({ User, Story, Review } = await getCollections());

  // Middleware
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.static('public'));


  const apiRouter = express.Router();
  app.use('/api', apiRouter);

  // Create a new user
  apiRouter.post('/auth/create', async (req, res) => {
    if (await User.findOne({ email: req.body.email })) {
      return res.status(409).json({ msg: 'Existing user' });
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const user = {
      email: req.body.email,
      password: passwordHash,
      token: uuid.v4(),
    };

    await User.insertOne(user);
    setAuthCookie(res, user.token);
    res.send({ email: user.email });
  });

  // Login user
  apiRouter.post('/auth/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user && await bcrypt.compare(req.body.password, user.password)) {
      user.token = uuid.v4();
      await User.updateOne({ email: user.email }, { $set: { token: user.token } });
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
      await User.updateOne({ token: req.cookies[authCookieName] }, { $unset: { token: "" } });
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

  apiRouter.get('/stories', verifyAuth, async (_req, res) => {
    const stories = await Story.find({}).toArray();
    res.send(stories);
  });

  apiRouter.post('/upload', verifyAuth, async (req, res) => {
    const { content, filename } = req.body;
    if (!content || !filename) {
      return res.status(400).json({ msg: 'Missing file content or filename' });
    }

    const story = {
      title: filename.replace('.txt', ''),
      content,
      author: req.user.email,
      createdAt: new Date(),
    };

    await Story.insertOne(story);
    res.status(201).json({ msg: 'Upload successful', story });
  });

  apiRouter.delete('/story/:id', verifyAuth, async (req, res) => {
    const { ObjectId } = require('mongodb');
    
    console.log('Delete request from user:', req.user.email);
    
    const result = await Story.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 1) {
      res.status(204).end();
    } else {
      res.status(404).json({ msg: 'Story not found' });
    }
  });

  apiRouter.get('/reviews', verifyAuth, async (req, res) => {
    const { storyId } = req.query;
    if (!storyId) return res.status(400).json({ msg: 'Missing storyId in query' });
    const reviews = await Review.find({ storyId }).toArray();
    res.send(reviews);
  });

  apiRouter.post('/review', verifyAuth, async (req, res) => {
    const { storyId, content } = req.body;
    if (!storyId || !content) return res.status(400).json({ msg: 'Missing storyId or content' });

    const newReview = {
      storyId,
      content,
      author: req.user.email,
      createdAt: new Date(),
    };

    await Review.insertOne(newReview);
    console.log(broadcastReview(newReview));
    broadcastReview(newReview);
    res.status(201).json({ msg: 'Review saved', review: newReview });
  });

  function setAuthCookie(res, authToken) {
    res.cookie(authCookieName, authToken, {
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
    });
  }

  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ type: err.name, message: err.message });
  });

  // Return the application's default page if the path is unknown
  app.use((_req, res) => {
    console.log('Unknown path, going to index.html');
    res.sendFile('index.html', { root: 'public' });
  });

  const server = app.listen(port, () => {
    console.log(`🚀 Server listening on port ${port}`);
  });

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






})();
