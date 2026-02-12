const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

/* ========= VALIDACIONES ========= */
// Nombre: letras (incluye acentos), espacios y punto. 3-40 chars.
const NAME_RE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ.\s]{3,40}$/;

// Email: formato normal (sin espacios ni caracteres raros)
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

// Password: 8-64, 1 mayúscula, 1 minúscula, 1 número, 1 símbolo permitido
// Símbolos permitidos: !@#$%^&*()_+\-=[]{};':"\\|,.<>/?`
const PASS_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`]{8,64}$/;

function isSafeString(s) {
  // Bloquea caracteres de control raros
  return typeof s === "string" && !/[\u0000-\u001F\u007F]/.test(s);
}

/* ================= REGISTRO ================= */
router.post("/register", async (req, res) => {
  try {
    let { name, email, password } = req.body;

    name = (name || "").trim();
    email = (email || "").trim().toLowerCase();
    password = password || "";

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    if (!isSafeString(name) || !isSafeString(email) || !isSafeString(password)) {
      return res.status(400).json({ message: "Datos inválidos" });
    }

    if (!NAME_RE.test(name)) {
      return res.status(400).json({
        message: "Nombre inválido: usa solo letras y espacios (3 a 40 caracteres).",
      });
    }

    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({
        message: "Correo inválido: escribe un correo válido sin espacios.",
      });
    }

    if (!PASS_RE.test(password)) {
      return res.status(400).json({
        message:
          "Contraseña inválida: mínimo 8, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo permitido.",
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error en el registro" });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    email = (email || "").trim().toLowerCase();
    password = password || "";

    if (!email || !password) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: "Correo inválido" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    req.session.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };

    res.status(200).json({
      message: "Login exitoso",
      user: req.session.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
});

/* ================= ME ================= */
router.get("/me", (req, res) => {
  if (!req.session?.user) return res.status(401).json({ message: "No autenticado" });
  res.json({ user: req.session.user });
});

/* ================= LOGOUT ================= */
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("bd.sid");
    res.json({ message: "Sesión cerrada" });
  });
});

module.exports = router;