

// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// DB
mongoose.connect('mongodb://localhost:27017/youtube-clone', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// Mongoose Schema
const Video = mongoose.model("Video", new mongoose.Schema({
  title: String,
  views: String,
  thumbnail: String,
  videoUrl: String, // הוספנו את זה
  description: String // ✅ חדש
}));

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);


// GET all videos
app.get('/videos', async (req, res) => {
  const videos = await Video.find();
  res.json(videos);
});

// POST new video
app.post('/videos', async (req, res) => {
  const video = new Video(req.body);
  await video.save();
  res.status(201).json(video);
});


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