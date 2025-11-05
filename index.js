// index.js
import express from "express";
import { engine } from "express-handlebars";

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
