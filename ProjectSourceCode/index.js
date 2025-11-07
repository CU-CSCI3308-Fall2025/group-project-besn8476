// index.js
const express = require("express");
const { engine } = require("express-handlebars");

const app = express();
const PORT = 3000;

// Log incoming requests so we see what's happening
app.use((req, res, next) => {
  console.log("➡️", req.method, req.url);
  next();
});

// Handlebars setup
app.engine("hbs", engine({ extname: ".hbs" }));
app.set("view engine", "hbs");
app.set("views", "./handlebars");

// Parse form submissions (for later)
app.use(express.urlencoded({ extended: true }));

// ---------- ROUTES ----------

// HOME – this is what / should show
app.get("/", (req, res) => {
  console.log("🏠 Rendering home.hbs");
  res.render("home", {
    layout: false,
    title: "CU Marketplace",
    loggedIn: false,
    username: "Mike",
  });
});

// LOGIN
app.get("/login", (req, res) => {
  console.log("🔐 Rendering login.hbs");
  res.render("login", {
    layout: false,
    title: "Login - CU Marketplace",
  });
});

// REGISTER
app.get("/register", (req, res) => {
  console.log("📝 Rendering register.hbs");
  res.render("register", {
    layout: false,
    title: "Register - CU Marketplace",
  });
});

// POST ITEM
app.get("/post", (req, res) => {
  console.log("📦 Rendering post_card.hbs");
  res.render("post_card", {
    layout: false,
    title: "Post an Item - CU Marketplace",
  });
});

// ---------- STATIC FILES (CSS, images, etc.) ----------
app.use(express.static("ProjectSourceCode"));

// ---------- TESTING ENDPOINT ----------
app.get("/welcome", (req, res) => {
  res.json({ status: "success", message: "Welcome!" });
});

// ---------- USER ENDPOINTS ----------
app.post("/api/users/register", (req, res) => {});
app.post("/api/users/login", (req, res) => {});
app.post("/api/users/logout", (req, res) => {});
app.get("/api/users", (req, res) => {});
app.get("/api/users/:userId", (req, res) => {});

// ---------- POST ENDPOINTS ----------
app.get("/api/posts", (req, res) => {});
app.get("/api/posts/:postId", (req, res) => {});
app.get("/api/posts/user/:userId", (req, res) => {});
app.post("/api/posts", (req, res) => {});
app.put("/api/posts/:postId", (req, res) => {});
app.delete("/api/posts/:postId", (req, res) => {});
app.get("/api/posts/search", (req, res) => {});
app.get("/api/posts/category/:name", (req, res) => {});
app.patch("/api/posts/:postId/status", (req, res) => {});

// ---------- CATEGORY ENDPOINTS ----------
app.get("/api/categories", (req, res) => {});
app.get("/api/categories/:categoryId", (req, res) => {});
app.post("/api/categories", (req, res) => {});
app.delete("/api/categories/:categoryId", (req, res) => {});

// ---------- START SERVER ----------
// ---------- START SERVER ----------
if (require.main === module) {
  // Only start the server if not in test mode
  app.listen(3000, () => {
    console.log("✅ Server running at http://localhost:3000");
  });
}

// Export the server for testing
module.exports = app.listen(3000);
