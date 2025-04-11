const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const app = express();

const authCookieName = 'token';

// The comments and users are saved in memory and disappear whenever the service is restarted.
let users = [];
let comments = [];
let stories = [];

// The service port. In production the front-end code is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 3000;

// JSON body parsing using built-in middleware
app.use(express.json());

// Use the cookie parser middleware for tracking authentication tokens
app.use(cookieParser());

// Serve up the front-end static content hosting
app.use(express.static('public'));

// Router for service endpoints
var apiRouter = express.Router();
app.use(`/api`, apiRouter);

// CreateAuth a new user
apiRouter.post('/auth/create', async (req, res) => {
  if (await findUser('email', req.body.email)) {
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await createUser(req.body.email, req.body.password);

    setAuthCookie(res, user.token);
    res.send({ email: user.email });
  }
});

// GetAuth login an existing user
apiRouter.post('/auth/login', async (req, res) => {
  const user = await findUser('email', req.body.email);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      user.token = uuid.v4();
      setAuthCookie(res, user.token);
      res.send({ email: user.email });
      return;
    }
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

// DeleteAuth logout a user
apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    delete user.token;
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// Middleware to verify that the user is authorized to call an endpoint
const verifyAuth = async (req, res, next) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};

// Getcomments
apiRouter.get('/comments', verifyAuth, (_req, res) => {
  res.send(comments);
});

// Submitcomment
apiRouter.post('/comment', verifyAuth, (req, res) => {
  comments = updatecomments(req.body);
  res.send(comments);
});

// Default error handler
app.use(function (err, req, res, next) {
  res.status(500).send({ type: err.name, message: err.message });
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// updatecomments considers a new comment for inclusion in the high comments.
function updatecomments(newcomment) {
  let found = false;
  for (const [i, prevcomment] of comments.entries()) {
    if (newcomment.comment > prevcomment.comment) {
      comments.splice(i, 0, newcomment);
      found = true;
      break;
    }
  }

  if (!found) {
    comments.push(newcomment);
  }

  if (comments.length > 10) {
    comments.length = 10;
  }

  return comments;
}

async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    email: email,
    password: passwordHash,
    token: uuid.v4(),
  };
  users.push(user);

  return user;
}

async function findUser(field, value) {
  if (!value) return null;

  return users.find((u) => u[field] === value);
}

// Get all stories
apiRouter.get('/stories', verifyAuth, (_req, res) => {
  res.send(stories);
});

// Add a new story
apiRouter.post('/story', verifyAuth, (req, res) => {
  const story = {
    id: uuid.v4(),
    title: req.body.title,
    content: req.body.content,
    author: req.body.author, // optional: you could also tie this to the authenticated user's email
  };

  stories.push(story);
  res.status(201).send(story);
});

// Delete a story by ID
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


// setAuthCookie in the HTTP response
function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
