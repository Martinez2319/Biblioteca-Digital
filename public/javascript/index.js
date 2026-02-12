async function getMe() {
  try {
    const res = await fetch("/auth/me", { credentials: "same-origin" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

function protectLinks(isLogged) {
  document.querySelectorAll(".protected").forEach((el) => {
    el.addEventListener("click", (e) => {
      // si es <a> y NO hay sesión -> manda a login
      if (!isLogged) {
        e.preventDefault();
        window.location.href = "/login";
        return;
      }

      // para botones/divs con data-go
      const go = el.dataset.go;
      if (go) window.location.href = go;
    });
  });
}

function setLoggedUI(user) {
  const userBadge = document.getElementById("userBadge");
  const loginLink = document.getElementById("loginLink");
  const logoutBtn = document.getElementById("logoutBtn");

  const ctaLoginBtn = document.getElementById("ctaLoginBtn");
  const requireTexts = document.querySelectorAll(".require-session-text");

  if (user) {
    // topbar
    userBadge.textContent = `👋 ${user.name}`;
    userBadge.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
    loginLink.classList.add("hidden");

    // index: ocultar CTA y letreros 🔒
    if (ctaLoginBtn) ctaLoginBtn.classList.add("hidden");
    requireTexts.forEach((el) => el.classList.add("hidden"));

    // logout
    logoutBtn.addEventListener("click", async () => {
      await fetch("/auth/logout", { method: "POST", credentials: "same-origin" });
      window.location.reload();
    });
  } else {
    // sin sesión: mostrar CTA y textos 🔒
    if (ctaLoginBtn) ctaLoginBtn.classList.remove("hidden");
    requireTexts.forEach((el) => el.classList.remove("hidden"));
  }
}

(async () => {
  const user = await getMe();
  setLoggedUI(user);
  protectLinks(!!user);
})();