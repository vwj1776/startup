const { connectToDatabase, closeDatabase, getCollections, getSystemSettings, updateMonthlyGoals } = require('./db');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const cors = require('cors'); 
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');
const { ObjectId } = require('mongodb');
const axios = require('axios');

const app = express();
const authCookieName = 'token';
const port = process.argv.length > 2 ? process.argv[2] : 4000;
// ADDED Flag collection
let User, Story, Review, Flag, Prompt;

let currentBroadcast = { message: '', messageId: null }; // Added for global popup broadcasts

// --- Centralized Admin List ---
const ADMIN_USERS = ['vwj1776', 'nodlev', 'vwj1776@gmail.com', 'nodlev76@gmail.com', 'shepardnlyman22@gmail.com'];
const checkIsAdmin = (user) => {
  return user.isAdmin === true || 
    (user.email && ADMIN_USERS.includes(user.email.toLowerCase().trim())) || 
    (user.username && ADMIN_USERS.includes(user.username.toLowerCase().trim()));
};

(async () => {
  try {
    await connectToDatabase();
    const collections = await getCollections();
    User = collections.User;
    Story = collections.Story;
    Review = collections.Review;
    Flag = collections.Report; // Initialize Flag (mapped to 'Report' collection in db.js)
    Prompt = collections.Prompt; // Initialize Prompt

    app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
    app.use(express.json());
    app.use(cookieParser());

    const apiRouter = express.Router();
    app.use('/api', apiRouter);

    const verifyUser = async (req, res, next) => {
      try {
        const token = req.cookies[authCookieName];
        if (!token) return res.status(401).send({ msg: 'Unauthorized' });
        const user = await User.findOne({ token });
        if (user) { 
          user.isAdmin = checkIsAdmin(user);
          req.user = user; 
          next(); 
        } else { res.status(401).send({ msg: 'Unauthorized' }); }
      } catch (err) {
        res.status(500).json({ msg: "Authentication middleware error. Your database might be disconnected or a collection is missing." });
      }
    };

  const verifyAdmin = async (req, res, next) => {
    const token = req.cookies[authCookieName];
    if (!token) return res.status(401).send({ msg: 'Unauthorized' });
    const user = await User.findOne({ token });
    if (user && checkIsAdmin(user)) { 
      user.isAdmin = true;
      req.user = user; 
      next(); 
    } else if (user) {
      res.status(403).send({ msg: 'Forbidden: Admins only' });
    }
      else { res.status(401).send({ msg: 'Unauthorized' }); }
    };

    // --- AUTH & REGISTRATION ---
    apiRouter.post('/auth/register', async (req, res) => {
      try {
        const { email, username, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(409).send({ msg: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = {
          email, username, password: hashedPassword, token: uuid.v4(),
          points: 0, hasPledged: false, curriculumCompleted: false, dateJoined: new Date()
        };

        await User.insertOne(user);
        res.cookie(authCookieName, user.token, { secure: true, httpOnly: true, sameSite: 'lax' });
        res.status(201).send({ email: user.email, username: user.username });
      } catch (err) { res.status(500).send({ msg: "Error creating account" }); }
    });

    apiRouter.post('/auth/login', async (req, res) => {
      try {
        const { identifier, password } = req.body;
        const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
        if (user && await bcrypt.compare(password, user.password)) {
          user.token = uuid.v4();
          await User.updateOne({ _id: user._id }, { $set: { token: user.token } });
          res.cookie(authCookieName, user.token, { secure: true, httpOnly: true, sameSite: 'lax' });
          return res.send({ email: user.email, username: user.username });
        }
        res.status(401).send({ msg: 'Unauthorized' });
      } catch (err) {
        res.status(500).json({ msg: "Login failed. Your database might be disconnected or a collection is missing." });
      }
    });

    apiRouter.post('/auth/logout', (req, res) => {
      try {
        res.clearCookie(authCookieName);
        res.status(204).end();
      } catch (err) {
        res.status(500).json({ msg: "Logout failed." });
      }
    });

    apiRouter.post('/auth/accept-pledge', verifyUser, async (req, res) => {
      try {
        await User.updateOne({ _id: req.user._id }, { $set: { hasPledged: true } });
        res.status(200).send({ msg: "Pledge accepted" });
      } catch (err) { res.status(500).send({ msg: "Error updating pledge" }); }
    });

    apiRouter.get('/user/me', async (req, res) => {
      try {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        const token = req.cookies[authCookieName];
        if (!token) return res.status(401).send({ msg: 'Unauthorized' });
        const user = await User.findOne({ token });
        if (user) {
          user.isAdmin = checkIsAdmin(user);
          const { password, ...safeUser } = user;
          return res.send(safeUser);
        }
        res.status(401).send({ msg: 'Unauthorized' });
      } catch (err) {
        res.status(500).json({ msg: "Could not fetch user. Your database might be disconnected or a collection is missing." });
      }
    });

    // --- USER PROFILE UPDATE (NEW) ---
    apiRouter.put('/user/me', verifyUser, async (req, res) => {
      try {
        const { bio } = req.body;
        // Update the bio field for the current user
        await User.updateOne({ _id: req.user._id }, { $set: { bio: bio } });
        res.json({ msg: "Profile updated successfully" });
      } catch (err) { res.status(500).json({ msg: "Error updating profile" }); }
    });

    // --- CHANGE PASSWORD ---
    apiRouter.post('/user/change-password', verifyUser, async (req, res) => {
      try {
        const { oldPw, newPw } = req.body;
        const match = await bcrypt.compare(oldPw, req.user.password); // req.user is set by verifyUser
        if (!match) return res.status(400).json({ msg: 'Incorrect old password.' });

        const newPasswordHash = await bcrypt.hash(newPw, 10);
        await User.updateOne({ _id: req.user._id }, { $set: { password: newPasswordHash } });
        res.json({ msg: 'Password updated successfully!' });
      } catch (error) { res.status(500).json({ msg: 'Server error' }); }
    });

    // --- REFERRAL SYSTEM ---
    apiRouter.post('/user/credit', verifyUser, async (req, res) => {
      try {
        const { referrerEmail } = req.body;
        if (req.user.referredBy) return res.status(400).json({ msg: "You have already credited someone." });
        
        // Find referrer by email (case-insensitive)
        const referrer = await User.findOne({ email: { $regex: new RegExp(`^${referrerEmail}$`, 'i') } });
        if (!referrer) return res.status(404).json({ msg: "Referred user not found." });
        
        if (req.user.email.toLowerCase() === referrer.email.toLowerCase()) return res.status(400).json({ msg: "You cannot credit yourself." });

        await User.updateOne({ _id: req.user._id }, { $set: { referredBy: referrer.email }, $inc: { points: 1 } });
        await User.updateOne({ email: referrer.email }, { $inc: { points: 15 } });

        res.json({ msg: "Credit successfully applied!" });
      } catch (err) { res.status(500).json({ msg: "Error applying credit" }); }
    });

    // --- REVIEWS & POINTS ---
    apiRouter.post('/review', verifyUser, async (req, res) => {
      try {
        const { storyId, content, storyTitle, storyAuthorEmail, tier } = req.body;
        if (req.user.email === storyAuthorEmail || req.user.username === storyAuthorEmail) {
          return res.status(403).json({ msg: "Self-reviews don't earn points." });
        }
        await Review.insertOne({
          storyId, storyTitle, storyAuthorEmail, tier: tier || 1, content,
          reviewerEmail: req.user.email, author: req.user.username || req.user.email, date: new Date()
        });
        let pts = (tier === 3) ? 5 : (tier === 2) ? 3 : 1;
        await User.updateOne({ _id: req.user._id }, { $inc: { points: pts } });

        if (req.user.referredBy) {
          await User.updateOne({ email: req.user.referredBy }, { $inc: { points: 1 } });
        }

        res.status(201).json({ msg: "Points awarded!" });
      } catch (err) { res.status(500).json({ msg: "Error" }); }
    });

    apiRouter.get('/author/private-reviews', verifyUser, async (req, res) => {
      try {
        const reviews = await Review.find({ storyAuthorEmail: req.user.email }).sort({ date: -1 }).toArray();
        res.json(reviews);
      } catch (err) { res.status(500).json({ msg: "Error fetching reviews" }); }
    });

    // --- PROMPTS ---
    apiRouter.post('/prompts', verifyUser, async (req, res) => {
      try {
        const { text } = req.body;
        const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
        if (!text || wordCount < 5) return res.status(400).json({ msg: "Prompt is too short." });
        if (wordCount > 100) return res.status(400).json({ msg: "Prompt cannot exceed 100 words." });

        await Prompt.insertOne({ text, authorEmail: req.user.email, authorUsername: req.user.username, date: new Date(), denials: [] });
        res.status(201).json({ msg: "Prompt submitted!" });
      } catch (err) {
        res.status(500).json({ msg: "Failed to submit prompt. The 'Prompt' collection may be missing." });
      }
    });

    apiRouter.get('/prompts/recommended', verifyUser, async (req, res) => {
      try {
        const prompts = await Prompt.aggregate([
          { $match: { authorEmail: { $ne: req.user.email }, 'denials.userId': { $ne: req.user._id.toString() } } },
          { $sample: { size: 3 } }
        ]).toArray();
        if (prompts.length > 0) res.json(prompts);
        else res.status(404).json({ msg: "No prompts available." });
      } catch (err) {
        res.status(500).json({ msg: "Failed to get prompts. The 'Prompt' collection may be missing." });
      }
    });

    apiRouter.post('/prompts/:id/deny', verifyUser, async (req, res) => {
      try {
        await Prompt.updateOne({ _id: new ObjectId(req.params.id) }, { $addToSet: { denials: { userId: req.user._id.toString() } } });
        res.json({ msg: "Prompt denied." });
      } catch (err) {
        res.status(500).json({ msg: "Failed to deny prompt. The 'Prompt' collection may be missing." });
      }
    });

    apiRouter.get('/author/stories-from-my-prompts', verifyUser, async (req, res) => {
      try {
          const myPrompts = await Prompt.find({ authorEmail: req.user.email }, { projection: { _id: 1 } }).toArray();
          const myPromptIds = myPrompts.map(p => p._id.toString());
          if (myPromptIds.length === 0) return res.json([]);

          const stories = await Story.find({
              promptId: { $in: myPromptIds },
              status: 'published'
          }).sort({ date: -1 }).toArray();
          res.json(stories);
      } catch (err) {
          res.status(500).json({ msg: "Error fetching stories from your prompts." });
      }
    });

    // --- SYSTEM SETTINGS & GOALS ---
    apiRouter.get('/system/settings', async (req, res) => {
      try {
        const settings = await getSystemSettings();
        res.json(settings);
      } catch (err) { res.status(500).json({ msg: "Error fetching settings" }); }
    });

    // --- FLAGS (NEW) ---
    apiRouter.post('/flag', verifyUser, async (req, res) => {
      try {
        const { type, targetId, targetTitle, reason, content } = req.body;
        await Flag.insertOne({
          type, targetId, targetTitle, reason, content,
          flaggedBy: req.user.email, date: new Date()
        });
        res.status(201).json({ msg: "Flagged successfully" });
      } catch (err) { res.status(500).json({ error: "Failed to submit flag" }); }
    });

    apiRouter.get('/admin/flags', verifyAdmin, async (req, res) => {
      const f = await Flag.find({}).sort({ date: -1 }).toArray();
      res.json(f);
    });

    apiRouter.delete('/admin/flag/:id', verifyAdmin, async (req, res) => {
      try { 
        await Flag.deleteOne({ _id: new ObjectId(req.params.id) }); 
        res.json({ msg: "Flag resolved" }); 
      } catch (err) { res.status(500).json({ msg: "Failed to delete flag" }); }
    });

    // --- STORIES ---
    // RESTORED: The missing GET route that broke the story view!
    apiRouter.get('/story/:id', async (req, res) => {
      try {
        const story = await Story.findOne({ _id: new ObjectId(req.params.id) });
        story ? res.json(story) : res.status(404).json({ msg: "Not found" });
      } catch (err) { res.status(400).json({ msg: "Invalid ID" }); }
    });

    apiRouter.get('/stories/trending', async (req, res) => {
      try {
        const stories = await Story.aggregate([
          { $match: { status: { $ne: 'draft' } } },
          { $lookup: { from: 'users', localField: 'authorEmail', foreignField: 'email', as: 'authorData' } },
          { $unwind: { path: '$authorData', preserveNullAndEmptyArrays: true } },
          { $sort: { "authorData.points": -1, "date": -1 } }
        ]).toArray();

        // Group stories by author
        const storiesByAuthor = {};
        stories.forEach(story => {
            if (!storiesByAuthor[story.authorEmail]) {
                storiesByAuthor[story.authorEmail] = {
                    score: story.authorData ? story.authorData.points : 0,
                    stories: []
                };
            }
            storiesByAuthor[story.authorEmail].stories.push(story);
        });

        // Sort author groups from highest score to lowest
        const sortedAuthorGroups = Object.values(storiesByAuthor).sort((a, b) => b.score - a.score);

        // Mix stories (Chunked round-robin: taking up to 2 stories per author at a time)
        const mixedStories = [];
        const STORIES_PER_AUTHOR_CHUNK = 2; // Change this number to control how many stories show at a time
        let storiesRemaining = true;
        while (storiesRemaining) {
            storiesRemaining = false;
            for (const group of sortedAuthorGroups) {
                const chunk = group.stories.splice(0, STORIES_PER_AUTHOR_CHUNK);
                if (chunk.length > 0) {
                    mixedStories.push(...chunk);
                    storiesRemaining = true;
                }
            }
        }

        res.json(mixedStories);
      } catch (err) { res.status(500).json({ msg: "Trending failed" }); }
    });

    apiRouter.get('/author/my-stories', verifyUser, async (req, res) => {
      try {
        const stories = await Story.find({ authorEmail: req.user.email }).sort({ date: -1 }).toArray();
        res.json(stories);
      } catch (err) { res.status(500).json({ msg: "Error fetching stories" }); }
    });

    apiRouter.post('/import-google-doc', verifyUser, async (req, res) => {
      const { url, title, genre } = req.body;
      const allowedGenres = ['Fantasy', 'Fiction', 'Nonfiction', 'Horror', 'Poetry', 'Sci-Fi'];

      if (!title?.trim() || !allowedGenres.includes(genre)) {
        return res.status(400).json({ msg: 'A title and valid genre are required.' });
      }

      let documentId;
      try {
        const docUrl = new URL(url);
        const match = docUrl.hostname === 'docs.google.com'
          ? docUrl.pathname.match(/^\/document\/(?:u\/\d+\/)?d\/([\w-]+)/)
          : null;
        if (docUrl.protocol !== 'https:' || !match) {
          return res.status(400).json({ msg: 'Enter a valid Google Docs sharing link.' });
        }
        documentId = match[1];
      } catch (err) {
        return res.status(400).json({ msg: 'Enter a valid Google Docs sharing link.' });
      }

      try {
        const googleDoc = await axios.get(
          `https://docs.google.com/document/d/${documentId}/export?format=txt`,
          { responseType: 'text', timeout: 15000, maxContentLength: 5 * 1024 * 1024 }
        );
        const content = typeof googleDoc.data === 'string' ? googleDoc.data.trim() : '';
        const contentType = googleDoc.headers['content-type'] || '';
        if (!content || contentType.includes('text/html')) {
          return res.status(422).json({ msg: 'Could not read this document. Set General access to “Anyone with the link” and try again.' });
        }

        const newStory = {
          title: title.trim(), content, genre,
          author: req.user.username, authorEmail: req.user.email, date: new Date(),
          status: 'published', promptId: null
        };
        const result = await Story.insertOne(newStory);
        return res.status(201).json({
          msg: 'Google Doc imported',
          story: { ...newStory, _id: result.insertedId }
        });
      } catch (err) {
        const status = err.response?.status;
        const msg = status === 403 || status === 404
          ? 'Google could not access this document. Set General access to “Anyone with the link” and try again.'
          : 'Unable to import the Google Doc right now. Please try again.';
        return res.status(502).json({ msg });
      }
    });

    apiRouter.post('/story', verifyUser, async (req, res) => {
      const { title, content, genre, status, promptId } = req.body;
      const newStory = { 
        title, content, genre, 
        author: req.user.username, authorEmail: req.user.email, date: new Date(),
        status: status || 'published', // Default to published if not specified
        promptId: promptId || null
      };
      const result = await Story.insertOne(newStory);
      
      if (req.user.referredBy) {
        await User.updateOne({ email: req.user.referredBy }, { $inc: { points: 3 } });
      }
      
      res.status(201).json({ msg: "Story saved", story: { ...newStory, _id: result.insertedId } });
    });

    // RESTORED: Edit route
    apiRouter.put('/story/:id', verifyUser, async (req, res) => {
      try {
        const storyId = new ObjectId(req.params.id);
        const { title, content, genre, status } = req.body;

        const originalStory = await Story.findOne({ _id: storyId, authorEmail: req.user.email });
        if (!originalStory) {
          return res.status(404).json({ msg: "Not found or not authorized" });
        }

        const result = await Story.updateOne({ _id: storyId }, { $set: { title, content, genre, status, lastUpdated: new Date() } });

        // If a draft from a prompt is being published, award a point.
        if (originalStory.promptId && originalStory.status === 'draft' && status === 'published') {
          await User.updateOne({ _id: req.user._id }, { $inc: { points: 1 } });
        }

        (result.matchedCount === 1) ? res.json({ msg: "Updated" }) : res.status(404).json({ msg: "Not found or not authorized" });
      } catch (err) { res.status(500).json({ msg: "Update failed" }); }
    });

    // RESTORED: Delete route
    apiRouter.delete('/story/:id', verifyUser, async (req, res) => {
      try {
        const story = await Story.findOne({ _id: new ObjectId(req.params.id) });
        if(!story) return res.status(404).json({msg: "Not found"});
        if (req.user.isAdmin || req.user.email === story.authorEmail) {
           await Story.deleteOne({ _id: new ObjectId(req.params.id) });
           res.json({ msg: "Deleted" });
        } else {
           res.status(403).json({ msg: "Not authorized" });
        }
      } catch (err) { res.status(500).json({ msg: "Delete failed" }); }
    });

    // --- ADMIN (Fully restored) ---
    apiRouter.get('/admin/stats', verifyAdmin, async (req, res) => {
      const u = await User.countDocuments();
      const s = await Story.countDocuments();
      res.json({ userCount: u, storyCount: s });
    });

    apiRouter.get('/admin/users', verifyAdmin, async (req, res) => {
      const all = await User.find({}).toArray();
      res.json(all.map(({ password, token, ...safe }) => safe));
    });

    apiRouter.get('/admin/reviews', verifyAdmin, async (req, res) => {
      const r = await Review.find({}).sort({ date: -1 }).toArray();
      res.json(r);
    });

    apiRouter.post('/admin/user/curriculum', verifyAdmin, async (req, res) => {
      try {
        const { email, completed } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });
        let pointChange = (completed && !user.curriculumCompleted) ? 25 : (!completed && user.curriculumCompleted) ? -25 : 0;
        await User.updateOne({ email }, { $set: { curriculumCompleted: completed }, $inc: { points: pointChange } });
        res.status(200).json({ msg: 'Updated' });
      } catch (e) { res.status(500).json({ error: 'Error' }); }
    });

    apiRouter.delete('/admin/review/:id', verifyAdmin, async (req, res) => {
      try { await Review.deleteOne({ _id: new ObjectId(req.params.id) }); res.json({ msg: "Review deleted" }); } 
      catch (err) { res.status(500).json({ msg: "Delete failed" }); }
    });
    
    apiRouter.delete('/admin/user/:email', verifyAdmin, async (req, res) => {
      try { await User.deleteOne({ email: req.params.email }); res.json({ msg: "User deleted" }); }
      catch (err) { res.status(500).json({ error: "Delete failed" }); }
    });
    
    apiRouter.post('/admin/user/status', verifyAdmin, async (req, res) => {
       try { await User.updateOne({ email: req.body.email }, { $set: { status: req.body.status } }); res.json({ msg: "Status updated" }); }
       catch (err) { res.status(500).json({ error: "Update failed" }); }
    });

    apiRouter.put('/admin/goals', verifyAdmin, async (req, res) => {
      try {
        await updateMonthlyGoals(req.body);
        res.json({ msg: "Goals updated" });
      } catch (err) { res.status(500).json({ msg: "Error updating goals" }); }
    });

    // --- BROADCAST ENDPOINTS ---
    apiRouter.get('/broadcast', (req, res) => {
      res.json(currentBroadcast);
    });

    apiRouter.post('/admin/broadcast', verifyAdmin, async (req, res) => {
      const { message } = req.body;
      currentBroadcast = {
        message: message,
        messageId: Date.now().toString()
      };
      res.json({ success: true, broadcast: currentBroadcast });
    });

    apiRouter.post('/user/dismiss-broadcast', verifyUser, async (req, res) => {
      try {
        await User.updateOne(
          { _id: req.user._id },
          { $set: { dismissedBroadcastId: req.body.messageId } }
        );
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: "Failed to update" });
      }
    });

    // --- STATIC FILES ---
    let frontendDir = path.join(__dirname, 'dist');
    if (!fs.existsSync(frontendDir)) frontendDir = path.join(__dirname, 'public');
    app.use(express.static(frontendDir));

    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) return res.status(404).json({ msg: "Not found" });
      res.sendFile(path.join(frontendDir, 'index.html'));
    });

    const server = app.listen(port, () => console.log(`🚀 Server on ${port}`));

    // --- GRACEFUL SHUTDOWN ---
    const shutdown = async () => {
      console.log('\n🛑 Shutting down server...');
      server.close(async () => {
        console.log('HTTP server closed.');
        await closeDatabase();
        process.exit(0);
      });

      // Force close if it takes too long (10 seconds)
      setTimeout(() => {
        console.error('⚠️ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (err) { console.error(err); }
})();