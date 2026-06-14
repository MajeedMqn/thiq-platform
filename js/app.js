const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const counters = document.querySelectorAll("[data-counter]");
const scoreRing = document.querySelector("[data-score]");
const scoreValue = document.querySelector("[data-score-value]");
const form = document.querySelector("[data-form]");
const formMessage = document.querySelector("[data-form-message]");

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

window.addEventListener("scroll", () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 18);
});

navToggle?.addEventListener("click", () => {
  const isOpen = nav?.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  navToggle.innerHTML = isOpen ? '<i class="ri-close-line"></i>' : '<i class="ri-menu-3-line"></i>';
});

nav?.addEventListener("click", (event) => {
  if (!(event.target instanceof HTMLAnchorElement)) return;

  nav.classList.remove("is-open");
  navToggle?.setAttribute("aria-expanded", "false");
  if (navToggle) {
    navToggle.innerHTML = '<i class="ri-menu-3-line"></i>';
  }
});

const animateNumber = (element, target) => {
  const duration = 900;
  const start = performance.now();

  const tick = (now) => {
    const progress = clamp((now - start) / duration, 0, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = String(Math.round(target * eased));

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      if (entry.target === scoreRing && scoreValue) {
        const score = Number(scoreRing.dataset.score || "0");
        scoreRing.style.setProperty("--score-angle", `${score * 3.6}deg`);
        animateNumber(scoreValue, score);
      }

      if (entry.target instanceof HTMLElement && entry.target.dataset.counter) {
        animateNumber(entry.target, Number(entry.target.dataset.counter));
      }

      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.35 }
);

if (scoreRing) {
  observer.observe(scoreRing);
}

counters.forEach((counter) => observer.observe(counter));

form?.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const email = String(data.get("email") || "").trim();

  if (!email || !formMessage) return;

  formMessage.textContent = "تم تسجيل اهتمامك. سنرسل لك دعوة الوصول المبكر قريباً.";
  form.reset();
});
