// index.js
import express from "express";
import { engine } from "express-handlebars";
import bcrypt from "bcryptjs";
import pg from "pg-promise";
import bodyParser from "body-parser";

const app = express();
const PORT = 4444;

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

// This MUST be after the routes so it doesn't override "/"
app.use(express.static("ProjectSourceCode"));

// ------------------------------

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});





////////////////////
// USER ENDPOINTS //
////////////////////

// create a new user
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user in DB
    const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);
    if (!user) {
      // If user not found → redirect to register
      return res.redirect('pages/register');
    }

    // Compare password hash
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.render('pages/login', { message: 'Incorrect username or password.' });
    }

    // Save user in session
    req.session.user = { id: user.id, username: user.username };

    // Redirect to discover page
    return res.redirect('handlebars/home');
  } catch (error) {
    console.error('Login error:', error);
    return res.render('pages/login', { message: 'Error logging in. Please try again.' });
  }
});

// authenticate user and return token/session
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user in DB
    const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);
    if (!user) {
      // If user not found → redirect to register
      return res.redirect('pages/register');
    }

    // Compare password hash
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.render('pages/login', { message: 'Incorrect username or password.' });
    }

    // Save user in session
    req.session.user = { id: user.id, username: user.username };

    // Redirect to discover page
    return res.redirect('handlebars/home');
  } catch (error) {
    console.error('Login error:', error);
    return res.render('pages/login', { message: 'Error logging in. Please try again.' });
  }
});

// log user out
app.post("/api/users/logout", (req, res) => {

});

// return all users
app.get("/api/users", (req, res) => {

});

// get user by id
app.get("/api/users/:userId", (req, res) => {

});



////////////////////
// POST ENDPOINTS //
////////////////////

// get all posts
app.get("/api/posts", (req, res) => {

});

// get post by id
app.get("/api/posts/:postId", (req, res) => {

});

// get posts by user id
app.get("/api/posts/user/:userId", (req, res) => {

});


// create post
app.post("/api/posts", (req, res) => {

});

// edit post by id
app.put("/api/posts/:postId", (req, res) => {

});


// delete post by id
app.delete("/api/posts/:postId", (req, res) => {

});


// get posts by search keyword
app.get("/api/posts/search?q=keyword", (req, res) => {

});

// get posts by category name
app.get("/api/posts/category/:name", (req, res) => {

});

// update post status (available, sold)
app.patch("/api/posts/:postId/status", (req, res) => {

});


////////////////////
// CATEGORY ENDPOINTS
////////////////////

// get all categories
app.get("/api/categories", (req, res) => {

});

// get category by id
app.get("/api/categories/:categoryId", (req, res) => {

});

// create new category
app.post("/api/categories", (req, res) => {

});

// update category by id
app.delete("/api/categories/:categoryId", (req, res) => {

});