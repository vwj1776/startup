const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const app = express();

const authCookieName = 'token';

// In-memory storage
let users = [];
let comments = [];
let stories = [];

const port = process.argv.length > 2 ? process.argv[2] : 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

const apiRouter = express.Router();
app.use('/api', apiRouter);

// Create a new user
apiRouter.post('/auth/create', async (req, res) => {
  if (await findUser('email', req.body.email)) {
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await createUser(req.body.email, req.body.password);
    setAuthCookie(res, user.token);
    res.send({ email: user.email });
  }
});

// Login
apiRouter.post('/auth/login', async (req, res) => {
  const user = await findUser('email', req.body.email);
  if (user && await bcrypt.compare(req.body.password, user.password)) {
    user.token = uuid.v4();
    setAuthCookie(res, user.token);
    res.send({ email: user.email });
    return;
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

// Logout
apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    delete user.token;
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// Auth middleware
const verifyAuth = async (req, res, next) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    req.user = user; // Attach user to request
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};

// Comments
apiRouter.get('/comments', verifyAuth, (_req, res) => {
  res.send(comments);
});

apiRouter.post('/comment', verifyAuth, (req, res) => {
  comments = updatecomments(req.body);
  res.send(comments);
});

function updatecomments(newcomment) {
  newcomment.createdAt = new Date().toISOString();
  comments.push(newcomment);
  if (comments.length > 10) {
    comments = comments.slice(-10); // Keep last 10
  }
  return comments;
}

// Stories
apiRouter.get('/stories', verifyAuth, (_req, res) => {
  res.send(stories);
});

apiRouter.post('/story', verifyAuth, (req, res) => {
  const story = {
    id: uuid.v4(),
    title: req.body.title,
    content: req.body.content,
    author: req.user.email, // Use logged-in user's email
    createdAt: new Date().toISOString(),
  };

  stories.push(story);
  res.status(201).send(story);
});

apiRouter.delete('/story/:id', verifyAuth, (req, res) => {
  const { id } = req.params;
  const index = stories.findIndex((s) => s.id === id);

  if (index !== -1) {
    stories.splice(index, 1);
    res.status(204).end();
  } else {
    res.status(404).send({ msg: 'Story not found' });
  }
});

// Create user
async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    email,
    password: passwordHash,
    token: uuid.v4(),
  };
  users.push(user);
  return user;
}

// Find user helper
async function findUser(field, value) {
  if (!value) return null;
  return users.find((u) => u[field] === value);
}

// Set auth cookie
function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

// Error handler
app.use((err, req, res, next) => {
  res.status(500).send({ type: err.name, message: err.message });
});

// Fallback route for unknown GETs (not POST/DELETE)
app.get('*', (_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
