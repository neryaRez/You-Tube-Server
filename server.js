// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const Video = require('./models/Video');
const User = require('./models/User');
const commentsRoutes = require('./routes/Comments');
const authRoutes = require('./routes/auth');
const verifyToken = require('./middlewares/verifyToken');

// Middleware
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/comments', commentsRoutes);

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/youtube-clone', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// Routes
app.get('/videos', async (req, res) => {
  const videos = await Video.find().populate('userId', 'username');
  if (!videos) return res.status(404).json({ message: "No videos found" });
  res.json(videos);
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});

app.get('/users/:id/videos', async (req, res) => {
  const { id } = req.params;
  try {
    const videos = await Video.find({ userId: id }).populate('userId', 'username');
    if (!videos || videos.length === 0) return res.status(404).json({ message: "No videos found for this user" });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: "Error fetching videos", error: err.message });
  }
});

app.post('/videos', verifyToken, async (req, res) => {
  const { title, videoUrl, thumbnail, description } = req.body;
  const userId = req.user.userId;
  const video = new Video({ title, videoUrl, thumbnail, description, views: "0", userId });
  await video.save();
  res.status(201).json(video);
});

app.delete('/videos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Video.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ message: "Video not found" });
    res.json({ message: "Video deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting video", error: err.message });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await User.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
});

app.patch('/videos/:id/views', async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    video.views = String(parseInt(video.views || 0) + 1);
    await video.save();
    res.json({ message: "View count updated", views: video.views });
  } catch (err) {
    res.status(500).json({ message: "Error updating views", error: err.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

app.listen(5000, () => {
  console.log('🚀 Server running on http://localhost:5000');
});

// Export the app
module.exports = app;
