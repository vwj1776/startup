const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

const uri = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}/?retryWrites=true&w=majority&appName=databasestorer`;
const client = new MongoClient(uri);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
}

async function getCollections() {
  const db = client.db(config.database);
  return {
    User: db.collection('users'),
    Story: db.collection('stories'),
    Review: db.collection('reviews'),
    ChatChunk: db.collection('airforce_chunks'),
  };
}

module.exports = {
  connectToDatabase,
  getCollections,
};
