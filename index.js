// index.js
import express from "express";
import handlebars from 'express-handlebars';
import Handlebars from "handlebars";


const app = express();
const PORT = 4444;

// Log incoming requests so we see what's happening
app.use((req, res, next) => {
  console.log("➡️", req.method, req.url);
  next();
});

const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: 'ProjectSourceCode/handlebars/views/layouts',
  partialsDir: 'ProjectSourceCode/handlebars/views/partials',
});

// Handlebars setup
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'ProjectSourceCode/handlebars/views');

// Parse form submissions (for later)
app.use(express.urlencoded({ extended: true }));

// ---------- ROUTES ----------

// HOME – this is what / should show
app.get("/", (req, res) => {
  console.log("🏠 Rendering home.hbs");
  res.render('pages/home.hbs', {
    layout: false,
    title: "CU Marketplace",
    loggedIn: false,
    username: "Mike",
  });
});


// LOGIN
app.get("/login", (req, res) => {
  console.log("🔐 Rendering login.hbs");
  res.render('pages/login', {
    layout: false,
    title: "Login - CU Marketplace",
  });
});

// REGISTER
app.get("/register", (req, res) => {
  console.log("📝 Rendering register.hbs");
  res.render('pages/register', {
    layout: false,
    title: "Register - CU Marketplace",
  });
});

// POST ITEM
app.get("/post", (req, res) => {
  console.log("📦 Rendering post_card.hbs");
  res.render('pages/post_card', {
    layout: false,
    title: "Post an Item - CU Marketplace",
  });
});

// ---------- STATIC FILES (CSS, images, etc.) ----------

// This MUST be after the routes so it doesn't override "/"
app.use(express.static("ProjectSourceCode"));

// ------------------------------

app.listen(4444);
console.log('Server is listening on port 3000');





////////////////////
// USER ENDPOINTS //
////////////////////

// create a new user
app.post("/api/users/register", (req, res) => {

});

// authenticate user and return token/session
app.post("/api/users/login", (req, res) => {

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
//app.get("/api/posts/search?q=keyword", (req, res) => {

//});

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