function setMsg(el, text, ok = false) {
  el.textContent = text;
  el.style.color = ok ? "green" : "#dc2626";
}

async function postJSON(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

// Regex (mismos criterios que backend)
const NAME_RE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ.\s]{3,40}$/;
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PASS_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`]{8,64}$/;

/* ============ TOGGLE PASSWORD (LOGIN) ============ */
const togglePwd = document.getElementById("togglePwd");
const loginPasswordInput = document.getElementById("loginPassword");

if (togglePwd && loginPasswordInput) {
  togglePwd.addEventListener("click", () => {
    loginPasswordInput.type = loginPasswordInput.type === "password" ? "text" : "password";
  });
}

/* ============ LOGIN ============ */
const loginForm = document.getElementById("loginForm");
const loginMsg = document.getElementById("loginMsg");

if (loginForm && loginMsg) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    if (!EMAIL_RE.test(email)) return setMsg(loginMsg, "Correo inválido");
    if (!password) return setMsg(loginMsg, "Escribe tu contraseña");

    setMsg(loginMsg, "Validando...");

    const { res, data } = await postJSON("/auth/login", { email, password });

    if (res.ok) {
      setMsg(loginMsg, "✅ Login exitoso", true);
      setTimeout(() => (window.location.href = "/"), 600);
    } else {
      setMsg(loginMsg, data.message || "Error al iniciar sesión");
    }
  });
}

/* ============ REGISTER ============ */
const registerForm = document.getElementById("registerForm");
const registerMsg = document.getElementById("registerMsg");

if (registerForm && registerMsg) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim().toLowerCase();
    const password = document.getElementById("registerPassword").value;

    if (!NAME_RE.test(name)) {
      return setMsg(registerMsg, "Nombre inválido: solo letras y espacios (3 a 40).");
    }
    if (!EMAIL_RE.test(email)) {
      return setMsg(registerMsg, "Correo inválido (sin espacios, formato correcto).");
    }
    if (!PASS_RE.test(password)) {
      return setMsg(
        registerMsg,
        "Contraseña: mínimo 8, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo."
      );
    }

    setMsg(registerMsg, "Creando cuenta...");

    const { res, data } = await postJSON("/auth/register", { name, email, password });

    if (res.ok) {
      setMsg(registerMsg, "✅ Cuenta creada. Ahora inicia sesión.", true);
      document.getElementById("reg-log").checked = false;
      registerForm.reset();
    } else {
      setMsg(registerMsg, data.message || "Error en el registro");
    }
  });
}