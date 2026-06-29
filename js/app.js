const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const counters = document.querySelectorAll("[data-counter]");
const scoreRings = document.querySelectorAll("[data-score]");
const progressBars = document.querySelectorAll("[data-progress]");
const form = document.querySelector("[data-form]");
const formMessage = document.querySelector("[data-form-message]");
const shareButton = document.querySelector("[data-share-profile]");
const shareMessage = document.querySelector("[data-share-message]");
const uploadButtons = document.querySelectorAll("[data-demo-upload]");
const uploadMessage = document.querySelector("[data-upload-message]");
const analysisButton = document.querySelector("[data-start-analysis]");
const analysisMessage = document.querySelector("[data-analysis-message]");
const profileCards = document.querySelectorAll("[data-profile-card]");
const profileSearch = document.querySelector("[data-profile-search]");
const profileFilters = document.querySelectorAll("[data-profile-filter]");
const reviewButton = document.querySelector("[data-send-review]");
const reviewMessage = document.querySelector("[data-review-message]");
const completionValue = document.querySelector("[data-completion-value]");
const completionProgress = document.querySelector("[data-completion-progress]");
const demoCountTargets = document.querySelectorAll("[data-demo-count]");

const DEMO_STORAGE_KEY = "thiq-demo-evidence";
const DEMO_BASE_COUNTS = {
  contracts: 12,
  invoices: 28,
  recommendations: 9,
  certificates: 5,
  achievements: 16,
};

const labels = {
  contracts: "\u0627\u0644\u0639\u0642\u0648\u062f",
  invoices: "\u0627\u0644\u0641\u0648\u0627\u062a\u064a\u0631",
  recommendations: "\u0627\u0644\u062a\u0648\u0635\u064a\u0627\u062a",
  certificates: "\u0634\u0647\u0627\u062f\u0627\u062a \u0627\u0644\u0625\u0646\u062c\u0627\u0632",
  achievements: "\u0625\u062b\u0628\u0627\u062a\u0627\u062a \u0627\u0644\u0645\u0634\u0627\u0631\u064a\u0639",
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const showDemoMessage = (message, target) => {
  if (target) {
    target.textContent = message;
    return;
  }

  window.alert(message);
};

const loadDemoEvidence = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) || "{}");
    return { ...DEMO_BASE_COUNTS, ...stored };
  } catch {
    return { ...DEMO_BASE_COUNTS };
  }
};

const saveDemoEvidence = (data) => {
  try {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Demo mode can still run without persistence if storage is unavailable.
  }
};

const getProfileCompletion = (data) => {
  const uploadedExtra = Object.entries(data).reduce((total, [key, value]) => {
    return total + Math.max(0, Number(value || 0) - DEMO_BASE_COUNTS[key]);
  }, 0);

  return clamp(72 + uploadedExtra * 3, 72, 100);
};

const applyDemoEvidence = () => {
  const data = loadDemoEvidence();

  demoCountTargets.forEach((target) => {
    const key = target.dataset.demoCount;
    if (!key || data[key] === undefined) return;
    target.textContent = String(data[key]);
  });

  const completion = getProfileCompletion(data);

  if (completionValue) {
    completionValue.dataset.counter = String(completion);
    completionValue.textContent = String(completion);
  }

  if (completionProgress) {
    completionProgress.dataset.progress = String(completion);
    completionProgress.style.width = `${completion}%`;
    completionProgress.parentElement?.setAttribute("aria-label", `Ø§ÙƒØªÙ…Ø§Ù„ Ø§Ù„Ù…Ù„Ù ${completion}%`);
  }
};

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

      if (entry.target instanceof HTMLElement && entry.target.dataset.score) {
        const score = Number(entry.target.dataset.score || "0");
        const value = entry.target.querySelector("[data-score-value]");

        entry.target.style.setProperty("--score-angle", `${score * 3.6}deg`);
        if (value) {
          animateNumber(value, score);
        }
      }

      if (entry.target instanceof HTMLElement && entry.target.dataset.counter) {
        animateNumber(entry.target, Number(entry.target.dataset.counter));
      }

      if (entry.target instanceof HTMLElement && entry.target.dataset.progress) {
        const progress = clamp(Number(entry.target.dataset.progress || "0"), 0, 100);
        entry.target.style.width = `${progress}%`;
      }

      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.35 }
);

applyDemoEvidence();
scoreRings.forEach((ring) => observer.observe(ring));
counters.forEach((counter) => observer.observe(counter));
progressBars.forEach((bar) => observer.observe(bar));

form?.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const email = String(data.get("email") || "").trim();

  if (!email || !formMessage) return;

  formMessage.textContent = "\u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0627\u0647\u062a\u0645\u0627\u0645\u0643. \u0633\u0646\u0631\u0633\u0644 \u0644\u0643 \u062f\u0639\u0648\u0629 \u0627\u0644\u0648\u0635\u0648\u0644 \u0627\u0644\u0645\u0628\u0643\u0631 \u0642\u0631\u064a\u0628\u0627\u064b.";
  form.reset();
});

shareButton?.addEventListener("click", () => {
  showDemoMessage("\u062a\u0645 \u062a\u062c\u0647\u064a\u0632 \u0645\u0634\u0627\u0631\u0643\u0629 \u0645\u0644\u0641 \u0627\u0644\u062b\u0642\u0629 \u0641\u064a \u0646\u0633\u062e\u0629 \u0627\u0644\u0639\u0631\u0636.", shareMessage);
});

uploadButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.demoUpload;
    if (!key) return;

    const data = loadDemoEvidence();
    data[key] = Number(data[key] || 0) + 1;
    saveDemoEvidence(data);
    applyDemoEvidence();

    const label = labels[key] || "\u0627\u0644\u0645\u0633\u062a\u0646\u062f";
    showDemoMessage(`\u062a\u0645 \u062d\u0641\u0638 ${label} \u0641\u064a \u0646\u0645\u0637 \u0627\u0644\u0639\u0631\u0636. \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0645\u062d\u0641\u0648\u0638\u0629 \u0645\u062d\u0644\u064a\u0627\u064b.`, uploadMessage);
  });
});

analysisButton?.addEventListener("click", (event) => {
  event.preventDefault();
  showDemoMessage("\u0628\u062f\u0623\u062a \u0645\u062d\u0627\u0643\u0627\u0629 \u062a\u062d\u0644\u064a\u0644 \u0627\u0644\u0645\u0644\u0641. \u0633\u064a\u062a\u0645 \u0641\u062a\u062d \u0645\u0644\u0641 \u0627\u0644\u062b\u0642\u0629.", analysisMessage);
  window.location.href = analysisButton.getAttribute("href") || "trust-profile.html";
});

const updateDecisionPanel = (card) => {
  const name = document.querySelector("[data-decision-name]");
  const score = document.querySelector("[data-decision-score]");
  const ring = document.querySelector("[data-decision-ring]");
  const rating = document.querySelector("[data-decision-rating]");
  const risk = document.querySelector("[data-decision-risk]");
  const readiness = document.querySelector("[data-decision-readiness]");
  const strengths = document.querySelector("[data-decision-strengths]");
  const ai = document.querySelector("[data-decision-ai]");

  const profileScore = Number(card.dataset.score || "0");
  const readinessText = card.dataset.readiness === "suitable" ? "\u0645\u0646\u0627\u0633\u0628\u0629" : "\u062a\u062d\u062a\u0627\u062c \u0645\u0631\u0627\u062c\u0639\u0629";

  if (name) name.textContent = card.dataset.name || "";
  if (score) score.textContent = String(profileScore);
  if (ring) ring.style.setProperty("--score-angle", `${profileScore * 3.6}deg`);
  if (rating) rating.textContent = card.dataset.rating || "";
  if (risk) risk.textContent = card.dataset.risk || "";
  if (readiness) readiness.textContent = readinessText;
  if (strengths) strengths.textContent = card.dataset.strengths || "";
  if (ai) ai.textContent = card.dataset.ai || "";
  if (reviewMessage) reviewMessage.textContent = "";
};

const selectProfileCard = (card) => {
  profileCards.forEach((profileCard) => profileCard.classList.remove("is-selected"));
  card.classList.add("is-selected");
  updateDecisionPanel(card);
};

profileCards.forEach((card) => {
  card.addEventListener("click", () => selectProfileCard(card));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectProfileCard(card);
    }
  });
});

const filterProfiles = () => {
  const query = String(profileSearch?.value || "").trim().toLowerCase();
  const filters = {};

  profileFilters.forEach((filter) => {
    filters[filter.dataset.profileFilter] = filter.value;
  });

  let firstVisible = null;

  profileCards.forEach((card) => {
    const searchText = `${card.dataset.name || ""} ${card.dataset.activity || ""}`.toLowerCase();
    const matchesSearch = !query || searchText.includes(query);
    const matchesTrust = !filters.trust || card.dataset.trust === filters.trust;
    const matchesActivity = !filters.activity || card.dataset.activityKey === filters.activity;
    const matchesReadiness = !filters.readiness || card.dataset.readiness === filters.readiness;
    const isVisible = matchesSearch && matchesTrust && matchesActivity && matchesReadiness;

    card.hidden = !isVisible;
    if (isVisible && !firstVisible) firstVisible = card;
  });

  const selected = document.querySelector("[data-profile-card].is-selected:not([hidden])");
  if (!selected && firstVisible) {
    selectProfileCard(firstVisible);
  }
};

profileSearch?.addEventListener("input", filterProfiles);
profileFilters.forEach((filter) => filter.addEventListener("change", filterProfiles));

reviewButton?.addEventListener("click", () => {
  showDemoMessage("\u062a\u0645\u062a \u0645\u062d\u0627\u0643\u0627\u0629 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0645\u0644\u0641 \u0644\u0644\u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u062a\u0645\u0648\u064a\u0644\u064a\u0629.", reviewMessage);
});

