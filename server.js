require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const authRoutes = require("./routes/auth");

const app = express();

// ===== MIDDLEWARES =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== ARCHIVOS ESTÁTICOS =====
app.use(express.static(path.join(__dirname, "public",)));

// ===== RUTAS HTML =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html", "index.html"));
});

app.get("/index", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html", "index.html"));
});

// 📌 RUTAS PARA LOGIN Y REGISTER
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/login.html"));
});

// ===== AUTH =====
app.use("/auth", authRoutes);

// ===== MONGODB =====
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch((err) => console.error("❌ Error MongoDB:", err.message));

// ===== SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Servidor activo en http://localhost:${PORT}`)
);
