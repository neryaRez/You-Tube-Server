// routes/comments.js
const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const authMiddleware = require('../middleware/auth');

// הוספת תגובה
router.post('/', authMiddleware, async (req, res) => {
  const { videoId, text } = req.body;
  try {
    const comment = await Comment.create({
      videoId,
      text,
      userId: req.user._id
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'שגיאה בהוספת תגובה' });
  }
});

//קבלת תגובות לפי מזהה וידאו
router.get('/:videoId', async (req, res) => {
    try {
      const comments = await Comment.find({ videoId: req.params.videoId })
        .populate('userId', 'username') // מציג את שם המשתמש
        .sort({ createdAt: -1 }); // אחרונות קודם
      res.json(comments);
    } catch (err) {
      res.status(500).json({ message: 'שגיאה בשליפת תגובות' });
    }
  });
  
  module.exports = router;
  