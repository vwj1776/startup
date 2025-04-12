const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  storyId: String,
  content: String,
  author: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Review', reviewSchema);
