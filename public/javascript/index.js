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
      if (!isLogged) {
        e.preventDefault();
        window.location.href = "/login";
        return;
      }
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
    userBadge.textContent = `👋 ${user.name}`;
    userBadge.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
    loginLink.classList.add("hidden");

    if (ctaLoginBtn) ctaLoginBtn.classList.add("hidden");
    requireTexts.forEach((el) => el.classList.add("hidden"));

    logoutBtn.addEventListener("click", async () => {
      await fetch("/auth/logout", { method: "POST", credentials: "same-origin" });
      window.location.reload();
    });
  } else {
    if (ctaLoginBtn) ctaLoginBtn.classList.remove("hidden");
    requireTexts.forEach((el) => el.classList.remove("hidden"));
  }
}

/* ===== GALERÍA 3D: círculo + mouse controla giro/velocidad ===== */
function initGallery3D() {
  const viewport = document.getElementById("galleryViewport");
  const ring = document.getElementById("galleryRing");
  if (!viewport || !ring) return;

  const cards = Array.from(ring.querySelectorAll(".gallery-card"));
  const count = cards.length;
  if (count < 3) return;

  // Radio del círculo 3D
  const radius = count <= 8 ? 260 : 300;
  const step = 360 / count;

  // Colocar cards en círculo (3D)
  cards.forEach((card, i) => {
    card.style.transform =
      `rotateY(${i * step}deg) translateZ(${radius}px) translateX(65px) translateY(70px)`;
  });

  // Animación
  let rot = 0;
  let speed = 0.12;
  let targetSpeed = 0.12;
  let tiltX = -12;

  function animate() {
    speed += (targetSpeed - speed) * 0.08;
    rot += speed;

    ring.style.setProperty("--rotY", `${rot}deg`);
    ring.style.setProperty("--tiltX", `${tiltX}deg`);

    requestAnimationFrame(animate);
  }

  viewport.addEventListener("mousemove", (e) => {
    const rect = viewport.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;   // 0..1
    const y = (e.clientY - rect.top) / rect.height;   // 0..1

    const dir = (x - 0.5) * 2; // -1..1
    targetSpeed = dir * 0.35;  // velocidad según izquierda/derecha

    tiltX = -22 + (y * 20);    // inclinación según arriba/abajo
  });

  viewport.addEventListener("mouseleave", () => {
    targetSpeed = 0.12;
    tiltX = -12;
  });

  animate();
}

/* ===== INIT ===== */
(async () => {
  const user = await getMe();
  setLoggedUI(user);
  protectLinks(!!user);
  initGallery3D();
})();