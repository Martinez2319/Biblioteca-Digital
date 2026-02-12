require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");

const authRoutes = require("./routes/auth");

const app = express();

/* ===== MIDDLEWARES ===== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===== SESIONES ===== */
app.use(
  session({
    name: "bd.sid",
    secret: process.env.SESSION_SECRET || "biblioteca_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 día
    },
  })
);

/* ===== STATIC: carpeta public es la raíz ===== */
app.use(express.static(path.join(__dirname, "public")));

/* ===== PROTECCIÓN ===== */
function requireAuth(req, res, next) {
  if (req.session?.user) return next();
  return res.redirect("/login");
}

/* ===== RUTAS HTML ===== */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html", "login.html"));
});

/* ===== RUTAS PROTEGIDAS ===== */
app.get("/categorias", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public/html", "categorias.html"));
});

app.get("/favoritos", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public/html", "favoritos.html"));
});

app.get("/perfil", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public/html", "perfil.html"));
});

/* ===== API AUTH ===== */
app.use("/auth", authRoutes);

/* ===== MONGODB ===== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch((err) => console.error("❌ Error MongoDB:", err.message));

/* ===== SERVER ===== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor activo en http://localhost:${PORT}`));