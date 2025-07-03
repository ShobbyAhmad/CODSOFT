const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const dotenv = require("dotenv");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ MongoDB Connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

// ✅ View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layout");

// ✅ Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ✅ Session setup
app.use(
  session({
    secret: "codsoft_blog_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  }),
);

// ✅ Make user info available in all views
app.use((req, res, next) => {
  if (req.session.userId) {
    res.locals.user = { _id: req.session.userId };
  } else {
    res.locals.user = null;
  }
  next();
});

// ✅ Routes
app.use("/", require("./routes/auth"));
app.use("/posts", require("./routes/post"));
app.use("/comments", require("./routes/comment"));
app.use("/contact", require("./routes/contact"));

// ✅ Root redirect to /posts
app.get("/", (req, res) => {
  res.redirect("/posts");
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
