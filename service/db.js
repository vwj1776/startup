const { MongoClient, ObjectId } = require('mongodb');
const config = require('./dbConfig.json');

const uri = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}/?retryWrites=true&w=majority&appName=databasestorer`;
const client = new MongoClient(uri);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    throw err; 
  }
}

async function getCollections() {
  const db = client.db(config.database);
  return {
    User: db.collection('users'),
    Story: db.collection('stories'),
    Review: db.collection('reviews'),
    System: db.collection('system'),
    Report: db.collection('reports'),
    Notification: db.collection('notifications') 
  };
}

async function getAdminStats() {
  const { User, Story, Report } = await getCollections();
  const userCount = await User.countDocuments({ status: { $ne: 'deleted' } });
  const storyCount = await Story.countDocuments();
  const flagCount = await Report.countDocuments({ status: 'pending' });
  const stories = await Story.find().toArray();
  const totalWords = stories.reduce((acc, s) => acc + (s.content ? s.content.split(/\s+/).length : 0), 0);
  return { userCount, storyCount, totalWords, flagCount };
}

async function getUsers() {
  const { User } = await getCollections();
  return await User.find({ status: { $ne: 'deleted' } }, { projection: { password: 0 } }).toArray();
}

// FIXED: Matching the "name: main" query used in index.js
async function getSystemSettings() {
  const { System } = await getCollections();
  const settings = await System.findOne({ name: 'main' });
  return settings || { bannedWords: [], aiFlags: 0 };
}

async function blockWord(word) {
  const { System } = await getCollections();
  return await System.updateOne(
    { name: 'main' }, 
    { $addToSet: { bannedWords: word.toLowerCase().trim() } }, 
    { upsert: true }
  );
}

async function unblockWord(word) {
  const { System } = await getCollections();
  return await System.updateOne(
    { name: 'main' }, 
    { $pull: { bannedWords: word.toLowerCase().trim() } }
  );
}

async function getFlaggedStories() {
  const { Report } = await getCollections();
  return await Report.find({}).toArray();
}

async function resolveReport(reportId, action, authorEmail, storyId, storyTitle) {
  const { Report, Story, User, Notification } = await getCollections();
  
  if (action === 'confirm') {
    if (storyId) {
      await Story.deleteOne({ _id: new ObjectId(storyId) });
    }
    await User.updateOne({ email: authorEmail.toLowerCase() }, { $inc: { pledgeViolations: 1 } });
    
    await Notification.insertOne({
      userEmail: authorEmail.toLowerCase(),
      message: `Your story "${storyTitle}" was removed for a Writing Pledge violation.`,
      date: new Date(),
      read: false
    });
  }
  return await Report.deleteOne({ _id: new ObjectId(reportId) });
}

// --- ALGORITHM HELPER FUNCTIONS ---

async function toggleFavorite(userEmail, authorEmail) {
  const { User } = await getCollections();
  const cleanUserEmail = userEmail.toLowerCase();
  const cleanAuthorEmail = authorEmail.toLowerCase();
  
  const user = await User.findOne({ email: cleanUserEmail });
  if (!user) return { error: 'User not found' };

  const favorites = user.favorites || [];

  if (favorites.includes(cleanAuthorEmail)) {
    await User.updateOne({ email: cleanUserEmail }, { $pull: { favorites: cleanAuthorEmail } });
    return { action: 'removed' };
  } else {
    await User.updateOne({ email: cleanUserEmail }, { $addToSet: { favorites: cleanAuthorEmail } });
    return { action: 'added' };
  }
}

async function updateCurriculumStatus(email, status) {
  const { User } = await getCollections();
  return await User.updateOne(
    { email: email.toLowerCase() }, 
    { $set: { curriculumCompleted: status } }
  );
}

async function incrementReviewCount(email, type) {
  const { User } = await getCollections();
  const field = type === 'deep' ? 'reviewsDeep' : 'reviewsEZ';
  return await User.updateOne(
    { email: email.toLowerCase() },
    { $inc: { [field]: 1 } }
  );
}

module.exports = {
  connectToDatabase,
  getCollections,
  getAdminStats,
  getUsers,
  getSystemSettings,
  blockWord,
  unblockWord,
  getFlaggedStories,
  resolveReport,
  toggleFavorite,
  updateCurriculumStatus,
  incrementReviewCount
};