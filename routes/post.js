const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");

// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.redirect("/login");
}

// GET /posts → Show all posts (with optional search)
router.get("/", async (req, res) => {
  const query = req.query.search || "";
  const posts = await Post.find({
    $or: [
      { title: new RegExp(query, "i") },
      { body: new RegExp(query, "i") }
    ]
  })
    .populate("author")
    .sort({ createdAt: -1 });

  res.render("index", { posts, title: "Home | Shobbify Blog" });
});

// GET /posts/new → Show form to create new post
router.get("/new", isLoggedIn, (req, res) => {
  res.render("newPost", { title: "Create New Post | CodSoft Blog" });
});

// POST /posts → Create new post
router.post("/", isLoggedIn, async (req, res) => {
  const { title, body, imageUrl } = req.body;
  await Post.create({ title, body, imageUrl, author: req.session.userId });
  res.redirect("/posts");
});

// DELETE /posts/:id → delete post
router.post("/:id/delete", isLoggedIn, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).send("Post not found");

  // Only author can delete
  if (post.author.toString() !== req.session.userId) {
    return res.status(403).send("Unauthorized");
  }

  await Post.findByIdAndDelete(req.params.id);
  res.redirect("/posts");
});

// GET /posts/:id → Show single post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author");
    const comments = await Comment.find({ post: post._id }).populate("user");
    if (!post) return res.status(404).send("Post not found");

    res.render("post", {
      post,
      comments,
      user: req.session.userId ? { _id: req.session.userId } : null,
      title: post.title + " | CodSoft Blog"
    });
  } catch (err) {
    res.status(500).send("Error loading post: " + err.message);
  }
});

module.exports = router;
