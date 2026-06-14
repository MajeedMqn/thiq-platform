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

scoreRings.forEach((ring) => observer.observe(ring));
counters.forEach((counter) => observer.observe(counter));
progressBars.forEach((bar) => observer.observe(bar));

form?.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const email = String(data.get("email") || "").trim();

  if (!email || !formMessage) return;

  formMessage.textContent = "تم تسجيل اهتمامك. سنرسل لك دعوة الوصول المبكر قريباً.";
  form.reset();
});

shareButton?.addEventListener("click", async () => {
  const shareUrl = window.location.href;
  const shareText = "ملف الثقة المهنية والمالية من ثِق";

  if (navigator.share) {
    try {
      await navigator.share({
        title: "ملف الثقة | ثِق",
        text: shareText,
        url: shareUrl,
      });
      if (shareMessage) shareMessage.textContent = "تم تجهيز مشاركة ملف الثقة.";
      return;
    } catch {
      // The user may cancel the native share sheet.
    }
  }

  try {
    await navigator.clipboard.writeText(shareUrl);
    if (shareMessage) shareMessage.textContent = "تم نسخ رابط ملف الثقة.";
  } catch {
    if (shareMessage) shareMessage.textContent = "رابط ملف الثقة جاهز للمشاركة.";
  }
});

uploadButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!uploadMessage) return;

    uploadMessage.textContent = "تمت محاكاة رفع المستند. الربط الفعلي سيضاف لاحقاً.";
  });
});

analysisButton?.addEventListener("click", () => {
  if (!analysisMessage) return;

  analysisMessage.textContent = "بدأت محاكاة تحليل الملف. لا يوجد اتصال بقاعدة بيانات في نسخة العرض.";
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
  const readinessText = card.dataset.readiness === "suitable" ? "مناسبة" : "تحتاج مراجعة";

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
  if (!reviewMessage) return;

  reviewMessage.textContent = "تمت محاكاة إرسال الملف للمراجعة التمويلية.";
});
