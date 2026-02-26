const { 
  connectToDatabase, getCollections 
} = require('./db');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const cors = require('cors'); 
const uuid = require('uuid');
const path = require('path');
const { ObjectId } = require('mongodb');

const app = express();
const authCookieName = 'token';
const port = process.argv.length > 2 ? process.argv[2] : 4000;

let User, Story, Review;

(async () => {
  try {
    await connectToDatabase();
    const collections = await getCollections();
    User = collections.User;
    Story = collections.Story;
    Review = collections.Review;

    app.use(cors({
      origin: 'http://localhost:5173', 
      credentials: true
    }));
    app.use(express.json());
    app.use(cookieParser());

    const apiRouter = express.Router();
    app.use('/api', apiRouter);

    const verifyUser = async (req, res, next) => {
      const token = req.cookies[authCookieName];
      const user = await User.findOne({ token });
      if (user) {
        req.user = user;
        next();
      } else {
        res.status(401).send({ msg: 'Unauthorized' });
      }
    };

    // --- AUTH ---
    apiRouter.post('/auth/login', async (req, res) => {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (user && await bcrypt.compare(password, user.password)) {
        user.token = uuid.v4();
        await User.updateOne({ _id: user._id }, { $set: { token: user.token } });
        res.cookie(authCookieName, user.token, { secure: false, httpOnly: true, sameSite: 'lax' });
        return res.send({ email: user.email, username: user.username });
      }
      res.status(401).send({ msg: 'Unauthorized' });
    });

    apiRouter.get('/user/me', async (req, res) => {
      const token = req.cookies[authCookieName];
      const user = await User.findOne({ token });
      if (user) return res.send(user);
      res.status(401).send({ msg: 'Unauthorized' });
    });

    // --- NOTIFICATIONS ---
    apiRouter.get('/notifications', verifyUser, async (req, res) => {
      res.json([]);
    });

    apiRouter.post('/notifications/clear', verifyUser, async (req, res) => {
        res.json({ msg: "Cleared" });
    });

    // --- REVIEWS ---
    apiRouter.get('/author/private-reviews', verifyUser, async (req, res) => {
      // Fetches reviews intended for this author
      const reviews = await Review.find({ storyAuthorEmail: req.user.email }).toArray();
      res.json(reviews);
    });

    // NEW: Added the POST route to handle incoming reviews
    apiRouter.post('/review', verifyUser, async (req, res) => {
      try {
        const { storyId, content, storyTitle, storyAuthorEmail } = req.body;
        
        await Review.insertOne({
          storyId,
          storyTitle,
          storyAuthorEmail,
          content,
          author: req.user.username || req.user.email,
          date: new Date()
        });

        res.status(201).json({ msg: "Review submitted!" });
      } catch (err) {
        console.error("Review error:", err);
        res.status(500).json({ msg: "Failed to save review" });
      }
    });

    // --- STORIES ---
    apiRouter.get('/stories/trending', async (req, res) => {
      const stories = await Story.find({}).toArray();
      res.json(stories);
    });

    apiRouter.get('/story/:id', async (req, res) => {
      try {
        const story = await Story.findOne({ _id: new ObjectId(req.params.id) });
        if (story) {
          res.json(story);
        } else {
          res.status(404).json({ msg: "Story not found" });
        }
      } catch (err) {
        res.status(400).json({ msg: "Invalid Story ID" });
      }
    });

    apiRouter.post('/story', verifyUser, async (req, res) => {
      const { title, content, genre } = req.body;
      await Story.insertOne({
        title, content, genre,
        author: req.user.username,
        authorEmail: req.user.email,
        date: new Date()
      });
      res.status(201).json({ msg: "Published" });
    });

    apiRouter.put('/story/:id', verifyUser, async (req, res) => {
      try {
        const storyId = req.params.id;
        const { title, content, genre } = req.body;
        const result = await Story.updateOne(
          { _id: new ObjectId(storyId), authorEmail: req.user.email },
          { $set: { title, content, genre, lastUpdated: new Date() } }
        );
        if (result.matchedCount === 1) {
          res.json({ msg: "Updated successfully" });
        } else {
          res.status(404).json({ msg: "Story not found or unauthorized" });
        }
      } catch (err) {
        res.status(500).json({ msg: "Update failed" });
      }
    });

    apiRouter.delete('/story/:id', verifyUser, async (req, res) => {
      try {
        const storyId = req.params.id;
        const result = await Story.deleteOne({ 
          _id: new ObjectId(storyId), 
          authorEmail: req.user.email 
        });
        if (result.deletedCount === 1) {
          res.json({ msg: "Deleted successfully" });
        } else {
          res.status(403).json({ msg: "Not authorized" });
        }
      } catch (err) {
        res.status(500).json({ msg: "Delete failed" });
      }
    });

    app.listen(port, () => console.log(`🚀 Server on ${port}`));
  } catch (err) { console.error(err); }
})();