const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// HERO SLIDER
const slides = document.querySelectorAll(".hero-slide");
const indicators = document.querySelectorAll(".indicator");
const heroCounter = document.getElementById("heroCounter");

let currentSlide = 0;
let sliderInterval;

function showSlide(index) {
  slides.forEach((slide) => slide.classList.remove("active"));
  indicators.forEach((dot) => dot.classList.remove("active"));

  slides[index].classList.add("active");
  indicators[index].classList.add("active");

  heroCounter.textContent = `0${index + 1} / 0${slides.length}`;

  currentSlide = index;
}

function nextSlide() {
  let next = (currentSlide + 1) % slides.length;
  showSlide(next);
}

function startSlider() {
  clearInterval(sliderInterval);
  sliderInterval = setInterval(nextSlide, 5000);
}

indicators.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    showSlide(index);
    startSlider();
  });
});

startSlider();

// SEARCH DESTINATION
const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");
const searchButton = document.getElementById("searchButton");

const cards = document.querySelectorAll(".destination-card");
const noResult = document.getElementById("noResult");

function filterDestinations() {
  const keyword = searchInput.value.toLowerCase().trim();
  const category = categorySelect.value;

  let found = 0;

  cards.forEach((card) => {
    const name = card.dataset.name;
    const cardCategory = card.dataset.category;

    const matchName = name.includes(keyword);
    const matchCategory = category === "all" || cardCategory === category;

    card.classList.toggle("is-filtered-out", !(matchName && matchCategory));
    if (matchName && matchCategory) found++;
  });

  noResult.hidden = found !== 0;

document.getElementById("destinasi").scrollIntoView({
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
    });
}

searchButton.addEventListener("click", filterDestinations);

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    filterDestinations();
  }
});

categorySelect.addEventListener("change", filterDestinations);

// SCROLL REVEAL ANIMATION
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
  },
);

document.querySelectorAll(".reveal").forEach((element) => {
  observer.observe(element);
});

// Tema
const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", function () {
  document.body.classList.toggle("dark-mode");

  const isDark = document.body.classList.contains("dark-mode");
  themeToggle.querySelector("i").className = isDark ? "ph ph-sun" : "ph ph-moon";
  themeToggle.setAttribute("aria-label", isDark ? "Aktifkan tema terang" : "Aktifkan tema gelap");
});
