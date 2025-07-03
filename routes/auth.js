const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");

// Register Page
router.get("/register", (req, res) => {
  res.render("register", { title: "Register | CodSoft Blog" });
});

// Handle Register
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.send("User already exists");

    const newUser = new User({ username, email, password });
    await newUser.save();
    req.session.userId = newUser._id;
    res.redirect("/posts");
  } catch (err) {
    res.send("Error: " + err.message);
  }
});

// Login Page
router.get("/login", (req, res) => {
  res.render("login", { title: "Login | Shobbify Blog" });
});

// Handle Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.send("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.send("Invalid credentials");

  req.session.userId = user._id;
  res.redirect("/posts");
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;
