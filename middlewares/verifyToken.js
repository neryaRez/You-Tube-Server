// middlewares/verifyToken.js
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1]; // 'Bearer TOKEN' → 'TOKEN'
  if (!token) return res.status(401).json({ message: "Invalid token format" });

  try {
    const decoded = jwt.verify(token, "secret123"); // אותו סוד כמו ב-auth
    req.user = decoded; // מוסיף את המשתמש ל־req
    next(); // ממשיכים לבקשה הבאה
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
