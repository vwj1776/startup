const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// --- 1. MOCK DATABASE ---
// In the future, replace this with a real database like MongoDB
const users = {
    'nery@greyhound.com': { email: 'nery@greyhound.com', commentsMade: 2, referrals: 0, curriculumCompleted: false },
    'gavin@greyhound.com': { email: 'gavin@greyhound.com', commentsMade: 15, referrals: 2, curriculumCompleted: true },
    'veldon@greyhound.com': { email: 'veldon@greyhound.com', commentsMade: 5, referrals: 1, curriculumCompleted: false }
};

const stories = [
    { id: 1, title: 'The Mean One', authorEmail: 'nery@greyhound.com' },
    { id: 2, title: 'The Post Office', authorEmail: 'gavin@greyhound.com' },
    { id: 3, title: 'The Solution', authorEmail: 'veldon@greyhound.com' }
];

// --- 2. THE RECOMMENDATION ALGORITHM ---
function calculateAuthorScore(email) {
    const user = users[email];
    if (!user) return 0;
    
    let score = 0;
    score += user.commentsMade * 2;       // 2 points per comment
    score += user.referrals * 10;         // 10 points per referral
    if (user.curriculumCompleted) {
        score += 20;                      // 20 points for completing the curriculum
    }
    return score;
}

app.get('/api/stories/recommended', (req, res) => {
    // Map through stories to attach their author's calculated score
    const scoredStories = stories.map(story => ({
        ...story,
        authorScore: calculateAuthorScore(story.authorEmail)
    }));

    // Group stories by author
    const storiesByAuthor = {};
    scoredStories.forEach(story => {
        if (!storiesByAuthor[story.authorEmail]) {
            storiesByAuthor[story.authorEmail] = {
                score: story.authorScore,
                stories: []
            };
        }
        storiesByAuthor[story.authorEmail].stories.push(story);
    });

    // Sort author groups from highest score to lowest
    const sortedAuthorGroups = Object.values(storiesByAuthor).sort((a, b) => b.score - a.score);

    // Mix stories (Chunked round-robin: taking up to 2 stories per author at a time)
    const mixedStories = [];
    const STORIES_PER_AUTHOR_CHUNK = 2; // Change this number to show 3 or 4 at a time instead!
    let storiesRemaining = true;

    while (storiesRemaining) {
        storiesRemaining = false;
        for (const group of sortedAuthorGroups) {
            const chunk = group.stories.splice(0, STORIES_PER_AUTHOR_CHUNK);
            if (chunk.length > 0) {
                mixedStories.push(...chunk);
                storiesRemaining = true; // We found stories this round, so keep looping
            }
        }
    }

    res.json(mixedStories);
});

// --- 3. EXISTING WEBSOCKET LOGIC ---
const messages = []; // In-memory storage for messages

wss.on('connection', (ws) => {
    console.log('Client connected');

    // Send existing messages to the newly connected client
    ws.send(JSON.stringify({ type: 'initial', data: messages }));

    ws.on('message', (message) => {
        console.log('Received:', message);

        // Store the message
        messages.push(message.toString());
        // Broadcast to all connected clients
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'new', data: message.toString() }));
            }
        });
    });

    ws.on('close', () => console.log('Client disconnected'));
});

// --- 4. MOCK AUTHENTICATION ROUTES ---
app.get('/api/user/me', (req, res) => {
    res.json({ email: 'gavin@greyhound.com' }); // Mock logged-in user
});

app.post('/api/auth/logout', (req, res) => {
    res.sendStatus(200);
});

server.listen(8080, () => {
    console.log("Express API & WebSocket server running on http://localhost:8080");
});