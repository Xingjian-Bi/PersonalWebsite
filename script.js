const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll(".site-nav a")];

if (sections.length && navLinks.length) {
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
}

const toast = document.querySelector(".toast");
let toastTimer;

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const value = button.getAttribute("data-copy");
    try {
      await navigator.clipboard.writeText(value);
      if (toast) {
        toast.classList.add("visible");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("visible"), 1800);
      }
    } catch {
      window.location.href = `mailto:${value}`;
    }
  });
});

const backToTop = document.querySelector("[data-back-to-top]");

if (backToTop) {
  const backToTopThreshold = () => Math.min(window.innerHeight * 0.42, 380);

  const updateBackToTop = () => {
    backToTop.classList.toggle("is-visible", window.scrollY > backToTopThreshold());
  };

  window.addEventListener("scroll", updateBackToTop, { passive: true });
  window.addEventListener("resize", updateBackToTop, { passive: true });
  updateBackToTop();

  backToTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  });
}

const projectTrack = document.querySelector("[data-project-track]");
const projectPrev = document.querySelector("[data-project-prev]");
const projectNext = document.querySelector("[data-project-next]");

if (projectTrack && projectPrev && projectNext) {
  const getProjectStep = () => {
    const firstCard = projectTrack.querySelector(".project-card");
    if (!firstCard) return 0;
    const styles = getComputedStyle(projectTrack);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
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
