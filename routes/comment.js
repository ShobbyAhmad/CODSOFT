const express = require("express");
const router = express.Router();
const Comment = require("../models/comment");
const Post = require("../models/post");

// Middleware: check if user logged in
function isLoggedIn(req, res, next) {
  if (req.session.userId) return next();
  res.redirect("/login");
}

// POST /comments → add new comment
router.post("/", isLoggedIn, async (req, res) => {
  try {
    const { postId, content } = req.body;
    await Comment.create({
      post: postId,
      user: req.session.userId,
      content,
    });
    res.redirect("/posts/" + postId);
  } catch (err) {
    res.status(500).send("Error adding comment: " + err.message);
  }
});

module.exports = router;
