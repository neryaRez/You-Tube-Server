// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const Video = require('./models/Video'); // Import the Video model
const User = require('./models/User'); // Import the User model
// Middlewares
app.use(cors());
app.use(express.json());

// DB
mongoose.connect('mongodb://localhost:27017/youtube-clone', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);


// GET all videos
app.get('/videos', async (req, res) => {
  const videos = await Video.find().populate('userId', 'username'); // Populate userId with username
  if (!videos) return res.status(404).json({ message: "No videos found" });
  res.json(videos);
});


// Get all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password field
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});

const commentRoutes = require('./routes/comments');
app.use('/comments', commentRoutes);

// POST new video – רק למשתמשים מחוברים

const verifyToken = require('./middlewares/verifyToken');
app.post('/videos', verifyToken, async (req, res) => {
  const { title, videoUrl, thumbnail, description } = req.body;
  const userId = req.user.userId; // נשלף מהטוקן המאומת

  const video = new Video({ title, videoUrl, thumbnail, description, views: "0", userId });
  await video.save();
  res.status(201).json(video);
});

//DELETE video by ID – רק למשתמשים מחוברים
app.delete('/videos/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await Video.findByIdAndDelete(id);
      if (!result) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json({ message: "Video deleted" });
    } catch (err) {
      res.status(500).json({ message: "Error deleting video", error: err.message });
    }
  });

  //Delete user by Id
  app.delete('/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await User.findByIdAndDelete(id);
      if (!result) {
        return res.status(404).json({ message: "User not found" });
      }
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
  
      // עדכון views
      const currentViews = parseInt(video.views || 0);
      video.views = String(currentViews + 1);
      await video.save();
  
      res.json({ message: "View count updated", views: video.views });
    } catch (err) {
      res.status(500).json({ message: "Error updating views", error: err.message });
    }
  });


// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

// Handle errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

app.listen(5000, () => {
  console.log('🚀 Server running on http://localhost:5000');
});

// Export the app for testing
module.exports = app;