const canvas = document.querySelector("#signal-canvas");
const ctx = canvas.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pointer = { x: 0, y: 0, active: false };
let particles = [];
let width = 0;
let height = 0;
let animationFrame = 0;

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.min(72, Math.max(34, Math.floor(width / 22)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.28,
    vy: (Math.random() - 0.5) * 0.28,
    r: Math.random() * 1.6 + 0.8,
  }));
}

function drawNetwork() {
  ctx.clearRect(0, 0, width, height);

  particles.forEach((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x < -20) particle.x = width + 20;
    if (particle.x > width + 20) particle.x = -20;
    if (particle.y < -20) particle.y = height + 20;
    if (particle.y > height + 20) particle.y = -20;

    if (pointer.active) {
      const dx = pointer.x - particle.x;
      const dy = pointer.y - particle.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 160) {
        particle.x -= dx * 0.0008;
        particle.y -= dy * 0.0008;
      }
    }
  });

  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const a = particles[i];
      const b = particles[j];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance < 128) {
        ctx.strokeStyle = `rgba(150, 242, 178, ${0.16 * (1 - distance / 128)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  particles.forEach((particle) => {
    ctx.fillStyle = "rgba(246, 242, 232, 0.42)";
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
    ctx.fill();
  });

  animationFrame = requestAnimationFrame(drawNetwork);
}

if (!reduceMotion && canvas && ctx) {
  resizeCanvas();
  drawNetwork();
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  });
  window.addEventListener("pointerleave", () => {
    pointer.active = false;
  });
}

const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll(".site-nav a")];

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-42% 0px -48% 0px", threshold: 0.01 },
);

sections.forEach((section) => observer.observe(section));

const toast = document.querySelector(".toast");
let toastTimer;

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const value = button.getAttribute("data-copy");
    try {
      await navigator.clipboard.writeText(value);
      toast.classList.add("visible");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove("visible"), 1800);
    } catch {
      window.location.href = `mailto:${value}`;
    }
  });
});

const projectTrack = document.querySelector("[data-project-track]");
const projectPrev = document.querySelector("[data-project-prev]");
const projectNext = document.querySelector("[data-project-next]");

if (projectTrack && projectPrev && projectNext) {
  const getProjectStep = () => {
    const firstCard = projectTrack.querySelector(".project-card");
    if (!firstCard) return 0;
    const gap = Number.parseFloat(getComputedStyle(projectTrack).columnGap) || 0;
    return firstCard.getBoundingClientRect().width + gap;
  };

  const updateProjectControls = () => {
    const maxScroll = projectTrack.scrollWidth - projectTrack.clientWidth - 1;
    projectPrev.disabled = projectTrack.scrollLeft <= 1;
    projectNext.disabled = projectTrack.scrollLeft >= maxScroll;
  };

  const moveProjects = (direction) => {
    projectTrack.scrollBy({
      left: getProjectStep() * direction,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  projectPrev.addEventListener("click", () => moveProjects(-1));
  projectNext.addEventListener("click", () => moveProjects(1));
  projectTrack.addEventListener("scroll", updateProjectControls, { passive: true });
  window.addEventListener("resize", updateProjectControls);
  updateProjectControls();
}

document.querySelectorAll(".glass-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    if (reduceMotion || window.innerWidth < 900) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -2.4;
    const rotateY = ((x / rect.width) - 0.5) * 2.4;
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

window.addEventListener("beforeunload", () => {
  cancelAnimationFrame(animationFrame);
});
