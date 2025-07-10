// routes/comments.js
const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const authMiddleware = require('../middlewares/verifyToken');
const cors = require('cors');
const verifyToken = require('../middlewares/verifyToken');
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

router.use(cors(corsOptions));
router.use(express.json());

//קבלת כל התגובות לצורך בדיקה 
router.get('/', async (req, res) => {
  try {
    const comments = await Comment.find().populate('userId', 'username'); // מציג את שם המשתמש
    res.json(comments);
  } catch (err) {
    console.error("❌ שגיאה בשליפת תגובות:", err);
    res.status(500).json({ message: "שגיאה בשרת" });
  }
});

// הוספת תגובה
router.post('/', verifyToken, async (req, res) => {
  try {
    const { videoId, text } = req.body;
    const comment = new Comment({
      userId: req.user.userId,
      videoId,
      text,
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    console.error("❌ שגיאה ביצירת תגובה:", err);
    res.status(500).json({ message: "שגיאה בשרת" });
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
  