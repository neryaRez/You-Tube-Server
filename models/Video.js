const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: String,
  views: String,
  thumbnail: String,
  videoUrl: String,
  description: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Video', videoSchema);
