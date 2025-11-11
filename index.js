// <!-- Import Dependencies -->
import express from "express";
const app = express();
import handlebars from "express-handlebars";
import Handlebars from "handlebars";
import path from "path";
import pgPromise from "pg-promise";
import bodyParser from "body-parser";
import session from "express-session";
import bcrypt from "bcryptjs";
import axios from "axios";

const __dirname = import.meta.dirname;

// <!-- Connect to DB -->
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: 'ProjectSourceCode/handlebars/views/layouts',
  partialsDir: 'ProjectSourceCode/handlebars/views/partials',
});


const pgp = pgPromise();

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || 5432;

const connectionString = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${DB_HOST}:${DB_PORT}/${process.env.POSTGRES_DB}`;
const db = pgp(connectionString);


// test database
db.connect()
  .then((obj) => {
    console.log("Database connection successful"); // this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch((error) => {
    console.log("ERROR:", error.message || error);
  });


// <!-- App Settings -->
// Handlebars setup
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'ProjectSourceCode/handlebars/views');
app.use(bodyParser.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// Log incoming requests so we see what's happening
app.use((req, res, next) => {
  console.log("➡️", req.method, req.url);
  next();
});

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

// LOGOUT
app.get("/logout", (req, res) => {
  console.log("🔐 Rendering login.hbs");
  res.render('pages/logout', {
    layout: false,
    title: "Logout - CU Marketplace",
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







////////////////////
// USER ENDPOINTS //
////////////////////

// create a new user
app.post("/api/users/register", async (req, res) => {
  try {
    const { username, password, email, phone_number } = req.body;

    // Basic validation
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    // Check if username or email already exists
    const existingUser = await db.oneOrNone(
      `SELECT * FROM users WHERE username = $1 OR email = $2`,
      [username, email]
    );

    if (existingUser) {
      return res.status(409).json({ error: "Username or email already taken." });
    }

    // Hash password 
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into DB
    const newUser = await db.one(
      `INSERT INTO users (username, password, email, phone_number)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, phone_number, created_at;`,
      [username, hashedPassword, email, phone_number]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });

  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// authenticate user and return token/session
app.post("/api/users/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await db.oneOrNone(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (!user) {
      return res.render("pages/login", { message: "User not found." });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.render("pages/login", { message: "Incorrect password." });
    }
    // commented out bc it was used for testing
    /*
    else{
      res.json({ message: "login successful",
      user: { id: user.id, username: user.username, email: user.email } });
    }
    */

    // (Assuming session middleware later)
    req.session = { user: user.username };
    res.redirect("views/pages/home");
  } catch (err) {
    console.error("Login error:", err);
    res.render("pages/login", { message: "Error logging in." });
  }
});

// log user out
app.post("/api/users/logout", (req, res) => {

});

// return all users
app.get("/api/users", async (req, res) => {
  try {
    // Fetch all users (excluding passwords for safety)
    const users = await db.any(`
      SELECT id, username, email, phone_number, created_at
      FROM users
      ORDER BY created_at DESC;
    `);

    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
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


// <!-- Start Server-->
app.listen(4444);
console.log('Server is listening on port 4444');