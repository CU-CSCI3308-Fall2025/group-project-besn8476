// <!-- Import Dependencies -->
import "dotenv/config";
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
const isProduction = process.env.NODE_ENV === "production";

const hbs = handlebars.create({
  extname: "hbs",
  layoutsDir: "ProjectSourceCode/handlebars/views/layouts",
  partialsDir: "ProjectSourceCode/handlebars/views/partials",
});

// Helpers
hbs.handlebars.registerHelper("formatDate", (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
});

const pgp = pgPromise();

const DB_PORT = process.env.DB_PORT || 5432;

const DB_HOST = process.env.DB_HOST || "db";
const DB_NAME = process.env.POSTGRES_DB || "marketplace";
const DB_USER = process.env.POSTGRES_USER || "postgres";
const DB_PASSWORD = process.env.POSTGRES_PASSWORD || "postgres";

const connectionString = process.env.DATABASE_URL
  ? process.env.DATABASE_URL // Render will inject this
  : `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

const db = pgp({
  connectionString,
  // Render-managed Postgres requires SSL; local usually not.
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

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
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "ProjectSourceCode/handlebars/views");

if (isProduction) {
  app.set("trust proxy", 1); // so secure cookies work on Render
}

app.use(bodyParser.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
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
app.get("/", async (req, res) => {
  console.log("🏠 Rendering home.hbs");

  const loggedIn = !!req.session.user; // true if user session exists
  const user = req.session.user;

  let categories = [];

  try {
    categories = await db.any(`
      SELECT id, name
      FROM categories
      ORDER BY name ASC;
    `);
  } catch (err) {
    console.error("Error fetching categories:", err);
    return res.status(500).json({ error: "Internal server error" });
  }

  res.render("pages/home.hbs", {
    layout: false,
    title: "CU Marketplace",
    loggedIn,
    user,
    categories,
  });
});

// LOGIN
app.get("/login", (req, res) => {
  console.log("🔐 Rendering login.hbs");
  res.render("pages/login", {
    layout: false,
    title: "Login - CU Marketplace",
  });
});

// LOGOUT
app.get("/logout", (req, res) => {
  console.log("🔐 Rendering login.hbs");
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).send("Error logging out");
    }

    res.clearCookie("connect.sid"); // delete session cookie

    res.render("pages/logout", {
      layout: false,
      title: "You have been logged out",
    });
  });
});

// REGISTER
app.get("/register", (req, res) => {
  console.log("📝 Rendering register.hbs");
  res.render("pages/register", {
    layout: false,
    title: "Register - CU Marketplace",
  });
});

// MY_ACCOUNT
app.get("/my-account", async (req, res) => {
  console.log("👤 Rendering my_account.hbs");
  const loggedIn = !!req.session.user; // true if user session exists
  const user = req.session.user;
  const userID = user ? user.id : null;
  const joinDate = user?.createdAt || user?.created_at || null;

  if (!loggedIn || !userID) {
    return res.redirect("/login");
  }

  try {
    const posts = await db.any(`
        SELECT 
          posts.*,
          users.username,
          users.email AS contact_info,
          categories.name AS category_name
        FROM posts
        LEFT JOIN users ON posts.user_id = users.id
        LEFT JOIN categories ON posts.category_id = categories.id
        WHERE posts.user_id = $1
        ORDER BY posts.created_at DESC;
      `, [userID]);

    const formattedPosts = posts.map(p => ({
      id: p.id,
      name: p.title,
      product: { info: p.description },
      user: { contact: p.contact_info },
      images: [{ url: p.image_url }],
      condition: p.condition,
      price: p.price !== null && p.price !== undefined ? Number(p.price).toFixed(2) : null,
      location: p.location,
      listed: p.created_at ? new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null,
      category: p.category_name
    }));

    res.render("pages/my_account", {
      layout: false,
      title: "My Account - CU Marketplace",
      loggedIn,
      user,
      joinDate,
      posts: formattedPosts,
    });
  } catch (err) {
    console.error("Error rendering account:", err);
    return res.status(500).send("Error loading account");
  }
});

// POST ITEM
app.get("/post", async (req, res) => {
  console.log("Rendering post_card.hbs");

  try {
    // fetch posts directly from DB
    const posts = await db.any(`
      SELECT 
        posts.*,
        users.username,
        users.email AS contact_info,
        categories.name AS category_name
      FROM posts
      LEFT JOIN users ON posts.user_id = users.id
      LEFT JOIN categories ON posts.category_id = categories.id
      ORDER BY posts.created_at DESC
    `);

    // format for Handlebars
    const formattedPosts = posts.map((p) => ({
      name: p.title,
      product: { info: p.description },
      user: { contact: p.contact_info },
      images: [{ url: p.image_url }],
      condition: p.condition,
      price:
        p.price !== null && p.price !== undefined
          ? Number(p.price).toFixed(2)
          : null,
      location: p.location,
      listed: p.created_at
        ? new Date(p.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : null,
    }));

    res.render("pages/post_card", {
      layout: false,
      title: "Available Items - CU Marketplace",
      results: formattedPosts,
      query: "", // empty search
      message: "Items loaded successfully.",
    });
  } catch (err) {
    console.error("Error rendering posts page:", err);
    res.status(500).send("Error loading posts");
  }
});

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
      return res
        .status(400)
        .json({ error: "Username and password are required." });
    }

    // CU Boulder email validation
    const cuEmailRegex = /^[A-Za-z0-9._%+-]+@colorado\.edu$/;

    if (!cuEmailRegex.test(email)) {
      return res.status(400).json({
        error: "Email must be a valid @colorado.edu address.",
      });
    }

    // Check if username or email already exists
    const existingUser = await db.oneOrNone(
      `SELECT * FROM users WHERE username = $1 OR email = $2`,
      [username, email]
    );

    if (existingUser) {
      return res
        .status(409)
        .json({ error: "Username or email already taken." });
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

    // user will be auto logged in once registered
    req.session.user = newUser;
    console.log("Login successful for", newUser.username);
    res.redirect("/");
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// authenticate user and return token/session
app.post("/api/users/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await db.oneOrNone("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (!user) {
      return res.render("pages/login", { message: "User not found." });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.render("pages/login", { message: "Incorrect password." });
    }

    req.session.user = user;
    console.log("Registration/ Login successful for", user.username);
    res.redirect("/");
  } catch (err) {
    console.error("Login error:", err);
    res.render("pages/login", { message: "Error logging in." });
  }
});

// logout user
// moving logic into logout page render
/*
app.post("/api/users/logout", (req, res) => {
  // If the user is logged in, destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Error logging out" });
    }
    // Send response
    res.json({ message: "Logged out successfully" });
  });
});
*/

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
app.get("/api/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await db.oneOrNone(
      `SELECT id, username, email, phone_number, created_at
        FROM users
        WHERE id = $1;`,
      [userId]
    );
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

////////////////////
// POST ENDPOINTS //
////////////////////

// get all posts

// get all posts will be moved into the posts page render
/*
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await db.any(`
      SELECT 
        posts.*,
        users.username,
        categories.name AS category_name
      FROM posts
      LEFT JOIN users ON posts.user_id = users.id
      LEFT JOIN categories ON posts.category_id = categories.id
      ORDER BY posts.created_at DESC
    `);

    res.json({
      count: posts.length,
      posts: posts
    });
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: "Failed to fetch posts." });
  }
});
*/

// get posts by user id
app.get("/api/posts/user/:userId", (req, res) => {});

// create post
app.post("/api/posts", async (req, res) => {
  const {
    user_id,
    title,
    description,
    price,
    category_id,
    condition,
    location,
    image_url,
    contact_info,
  } = req.body;

  try {
    // Validate user and title
    if (!user_id) {
      return res.status(400).json({
        error: "user_id is required.",
      });
    }
    if (!title) {
      return res.status(400).json({
        error: "title is required.",
      });
    }

    // Check if the user exists (foreign key constraint)
    const existingUser = await db.oneOrNone(
      "SELECT id FROM users WHERE id = $1",
      [user_id]
    );
    if (!existingUser) {
      return res.status(404).json({
        error: "User does not exist.",
      });
    }

    // Check category exists (if provided)
    if (
      category_id !== undefined &&
      category_id !== null &&
      category_id !== ""
    ) {
      const categoryExists = await db.oneOrNone(
        "SELECT id FROM categories WHERE id = $1",
        [category_id]
      );
      if (!categoryExists) {
        return res.status(404).json({ error: "Category does not exist." });
      }
    }

    // Insert the post
    const newPost = await db.one(
      `INSERT INTO posts 
        (user_id, title, description, price, category_id, condition, location, image_url, contact_info)
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        user_id,
        title,
        description || null,
        price || null,
        category_id || null,
        condition || null,
        location || null,
        image_url || null,
        contact_info || null,
      ]
    );

    return res.redirect("/post");
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({
      error: "Failed to create post.",
    });
  }
});

// edit post by id
app.put("/api/posts/:postId", async (req, res) => {
  const { postId } = req.params;
  const { title, description, price, category_id, is_active, condition, location, image_url } = req.body;

  try {
    const updatedPost = await db.oneOrNone(
      `UPDATE posts
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           category_id = COALESCE($4, category_id),
           is_active = COALESCE($5, is_active),
           condition = COALESCE($6, condition),
           location = COALESCE($7, location),
           image_url = COALESCE($8, image_url),
           updated_at = NOW()
       WHERE id = $9
       RETURNING id, title, description, price, category_id, is_active, condition, location, image_url, created_at, updated_at;`,
      [
        title || null,
        description || null,
        price !== undefined && price !== null && !Number.isNaN(Number(price)) ? Number(price) : null,
        category_id || null,
        typeof is_active === "boolean" ? is_active : null,
        condition || null,
        location || null,
        image_url || null,
        postId
      ]
    );

    if (!updatedPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.status(200).json({
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (err) {
    console.error("Error updating post:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// delete post by id
app.delete("/api/posts/:postId", async (req, res) => {
  const { postId } = req.params;

  try {
    const result = await db.result(`DELETE FROM posts WHERE id = $1`, [postId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// get posts by search keyword
app.get("/api/posts/search", async (req, res) => {
  try {
    const q = req.query.q || "";
    // search checks the title, description, location, condition
    const posts = await db.any(
      `
      SELECT 
        posts.*,
        users.username,
        users.email AS contact_info,
        categories.name AS category_name
      FROM posts
      LEFT JOIN users ON posts.user_id = users.id
      LEFT JOIN categories ON posts.category_id = categories.id
      WHERE 
        posts.title ILIKE $1
        OR posts.description ILIKE $1
        OR posts.location ILIKE $1
        OR posts.condition ILIKE $1
      ORDER BY posts.created_at DESC;
    `,
      [`%${q}%`]
    );

    const formattedPosts = posts.map((p) => ({
      name: p.title,
      product: { info: p.description },
      user: { contact: p.contact_info },
      images: [{ url: p.image_url }],
      condition: p.condition,
      price:
        p.price !== null && p.price !== undefined
          ? Number(p.price).toFixed(2)
          : null,
      location: p.location,
      listed: p.created_at
        ? new Date(p.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : null,
    }));

    // re-render page with different only searched for posts
    res.render("pages/post_card", {
      layout: false,
      title: `Search results for "${q}"`,
      results: formattedPosts,
      query: q, // keeps the text in the search input
      message: "Items loaded successfully.",
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).send("Error searching posts");
  }
});

// get posts by category name
app.get("/api/posts/category/:name", (req, res) => {});

// update post status (available, sold)
app.patch("/api/posts/:postId/status", (req, res) => {});

// get post by id
app.get("/api/posts/:postId", (req, res) => {});

////////////////////
// CATEGORY ENDPOINTS
////////////////////

// get all categories
// adding this directly into the home page render
/*
app.get("/api/categories", async (req, res) => {
  try{
    const categories = await db.any(`
      SELECT id, name
      FROM categories
      ORDER BY name ASC;
    `);
    res.json(categories);
  }catch(err){
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
*/

// get category by id
app.get("/api/categories/:categoryId", async (req, res) => {
  try {
    const id = req.params.categoryId;
    const category = await db.oneOrNone(
      `
      SELECT id, name
      FROM categories
      WHERE id = $1;
    `,
      [id]
    );
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(category);
  } catch (err) {
    console.error("Error fetching category:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// create new category
app.post("/api/categories", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }
    const newCategory = await db.one(
      `
      INSERT INTO categories (name)
      VALUES ($1)
      RETURNING id, name;
    `,
      [name]
    );
    res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (err) {
    console.error("Error creating category:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// delete category by id
app.delete("/api/categories/:categoryId", async (req, res) => {
  try {
    const id = req.params.categoryId;
    const result = await db.result(
      `
      DELETE FROM categories
      WHERE id = $1;
    `,
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------- STATIC FILES (CSS, images, etc.) ----------

// This MUST be after the routes so it doesn't override "/"
app.use(express.static("ProjectSourceCode"));

// <!-- Start Server-->
const PORT = process.env.PORT || 4444; // Render injects PORT; local defaults to 4444
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

export default app;
