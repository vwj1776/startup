const mongoose = require('mongoose');

const connectToDatabase = async () => {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    console.error('❌ Missing MONGO_URL in environment variables');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectToDatabase;
