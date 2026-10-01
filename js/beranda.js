/* Fitur lokal beranda: slider hero, video latar, dan animasi scroll reveal. */
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
);

// Slider hero: mengganti gambar utama secara berkala dan melalui indikator.
const slides = document.querySelectorAll(".hero-slide");
const indicators = document.querySelectorAll(".indicator");
const heroCounter = document.getElementById("heroCounter");
const hero = document.getElementById("home");
const heroVideo = document.getElementById("heroVideo");
const videoSlide = heroVideo ? heroVideo.closest(".hero-slide") : null;

let currentSlide = 0;
let sliderInterval;
let heroVisible = true;

// Video hanya diputar ketika slide-nya aktif dan hero sedang terlihat.
function syncHeroVideo() {
  if (!heroVideo || !videoSlide) return;

  const shouldPlay =
    !prefersReducedMotion.matches &&
    heroVisible &&
    videoSlide.classList.contains("active");

  if (shouldPlay) {
    heroVideo.play().catch(() => {});
  } else {
    heroVideo.pause();
  }
}

function showSlide(index) {
  slides.forEach((slide) => slide.classList.remove("active"));
  indicators.forEach((dot) => dot.classList.remove("active"));

  slides[index].classList.add("active");
  indicators[index].classList.add("active");

  heroCounter.textContent = `0${index + 1} / 0${slides.length}`;

  currentSlide = index;

  syncHeroVideo();
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

// Hentikan video saat hero di luar area pandang agar tidak berjalan sia-sia.
if (hero && heroVideo) {
  const heroObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        heroVisible = entry.isIntersecting;
      });
      syncHeroVideo();
    },
    { threshold: 0.15 },
  );

  heroObserver.observe(hero);
}

startSlider();

// Animasi reveal: menampilkan komponen ketika masuk ke area pandang.
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
