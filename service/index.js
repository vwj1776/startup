const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const app = express();

const authCookieName = 'token';

// The reviews and users are saved in memory and disappear whenever the service is restarted.
let users = [];
let reviews = [];
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

const verifyAuth = async (req, res, next) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    req.user = user; 
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};


apiRouter.get('/reviews', verifyAuth, (req, res) => {
  const { storyId } = req.query;
  if (!storyId) {
    return res.status(400).json({ msg: 'Missing storyId in query' });
  }

  const storyReviews = reviews.filter((r) => r.storyId === storyId);
  res.send(storyReviews);
});


apiRouter.post('/review', verifyAuth, (req, res) => {
  const { storyId, content } = req.body;

  if (!storyId || !content) {
    return res.status(400).json({ msg: 'Missing storyId or content' });
  }

  const newReview = {
    id: uuid.v4(),
    storyId,
    content,
    author: req.user.email,
    createdAt: new Date().toISOString(),
  };

  reviews.push(newReview);

  res.status(201).json({ msg: 'Review saved', review: newReview });
});


// Default error handler
app.use(function (err, req, res, next) {
  res.status(500).send({ type: err.name, message: err.message });
});

// Return the application's default page if the path is unknown
// app.use((_req, res) => {
//   res.sendFile('index.html', { root: 'public' });
// });

// updatereviews considers a new review for inclusion in the high reviews.
function updatereviews(newreview) {
  let found = false;
  for (const [i, prevreview] of reviews.entries()) {
    if (newreview.review > prevreview.review) {
      reviews.splice(i, 0, newreview);
      found = true;
      break;
    }
  }

  if (!found) {
    reviews.push(newreview);
  }

  if (reviews.length > 10) {
    reviews.length = 10;
  }

  return reviews;
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

apiRouter.post('/upload', verifyAuth, (req, res) => {
  try {
    const { content, filename } = req.body;
    console.log('Incoming upload:', { content, filename, user: req.user });

    if (!content || !filename) {
      return res.status(400).json({ msg: 'Missing file content or filename' });
    }

    const story = {
      id: uuid.v4(),
      title: filename.replace('.txt', ''),
      content,
      author: req.user.email,
      createdAt: new Date().toISOString(),
    };

    stories.push(story);
    res.status(201).json({ msg: 'Upload successful', story });
  } catch (err) {
    console.error('UPLOAD ERROR:', err);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
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
