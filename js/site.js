/*
 * Pengelola fitur global situs Pesona Malang.
 * Komponen: tema, navbar responsif, pencarian, filter kartu, sorotan hasil,
 * dan tombol kembali ke atas.
 */
(() => {
  "use strict";

  // Referensi komponen global yang mungkin tersedia di setiap halaman.
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".primary-nav");
  const searchToggle = document.querySelector("#search-toggle");
  const searchPanel = document.querySelector("#site-search");
  const searchForm = document.querySelector("#search-form");
  const searchInput = document.querySelector("#search-input");
  const searchClear = document.querySelector("#search-clear");
  const searchStatus = document.querySelector("#search-status");
  const backToTop = document.querySelector("#back-to-top");
  const themeToggle = document.querySelector("#theme-toggle");
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const filterButtons = [...document.querySelectorAll(".filter-button")];
  // Semua bentuk kartu didukung agar pencarian konsisten di seluruh halaman.
  const cards = [...document.querySelectorAll(".destination-card, .destination-list .card, .review-card")];
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  const scrollBehavior = () => prefersReducedMotion.matches ? "auto" : "smooth";

  // Teks aksesibilitas dan status pencarian dipusatkan agar seragam antar halaman.
  const COPY = {
    searchOpen: "Sorot destinasi di halaman ini",
    searchClose: "Tutup panel sorotan",
    searchClear: "Hapus kata kunci",
    menuOpen: "Buka menu navigasi",
    menuClose: "Tutup menu navigasi",
    result: (n, q) => `${n} hasil untuk "${q}"`,
    empty: (q) => `Tidak ada hasil yang cocok dengan "${q}".`,
    unavailable: "Belum ada konten yang bisa disorot di halaman ini.",
  };

  // Tema disimpan di satu tempat supaya semua halaman menggunakan preferensi yang sama.
  const THEME_KEY = "pesona-malang-theme";
  const THEME_UI = {
    light: { color: "#1675c1", label: "Aktifkan tema gelap" },
    dark: { color: "#0b1422", label: "Aktifkan tema terang" },
  };
  const readSavedTheme = () => {
    try { return localStorage.getItem(THEME_KEY); } catch { return null; }
  };
  const saveTheme = (theme) => {
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* mode privat tetap didukung */ }
  };
  const applyTheme = (theme) => {
    const name = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = name;
    themeColor?.setAttribute("content", THEME_UI[name].color);
    themeToggle?.setAttribute("aria-pressed", String(name === "dark"));
    themeToggle?.setAttribute("aria-label", THEME_UI[name].label);
  };
  applyTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  themeToggle?.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
    saveTheme(next);
  });
  prefersDark.addEventListener("change", (event) => {
    if (!readSavedTheme()) applyTheme(event.matches ? "dark" : "light");
  });

  // Normalisasi membuat pencarian tidak sensitif terhadap huruf besar dan aksen.
  const normalize = (value) => value.toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  // Teks kartu dibaca dari isi yang tampil, bukan hanya dari atribut tertentu.
  const haystack = new Map(cards.map((card) => [card, normalize(card.textContent ?? "")]));
  let category = filterButtons.find((button) => button.getAttribute("aria-pressed") === "true")?.dataset.filter ?? "semua";
  let query = "";

  // Menghapus sorotan lama sebelum membuat sorotan baru agar hasil tidak bertumpuk.
  const clearHighlights = () => {
    document.querySelectorAll("mark.search-highlight").forEach((mark) => {
      mark.replaceWith(document.createTextNode(mark.textContent ?? ""));
    });
    // Satukan kembali node teks yang terpecah oleh highlight sebelumnya.
    cards.forEach((card) => card.normalize());
  };
  // Menyoroti kata pencarian pada node teks kartu tanpa merusak elemen HTML.
  const highlightMatches = (rawQuery) => {
    clearHighlights();
    const terms = rawQuery.trim().split(/\s+/).filter(Boolean).sort((a, b) => b.length - a.length);
    if (!terms.length) return;
    const escaped = terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
    cards.forEach((card) => {
      if (card.classList.contains("is-filtered-out")) return;
      const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const parent = node.parentElement;
        if (parent && !parent.closest("script, style, mark, i") && pattern.test(node.nodeValue ?? "")) {
          nodes.push(node);
        }
        pattern.lastIndex = 0;
      }
      nodes.forEach((node) => {
        const fragment = document.createDocumentFragment();
        const text = node.nodeValue ?? "";
        let lastIndex = 0;
        pattern.lastIndex = 0;
        text.replace(pattern, (match, _group, offset) => {
          fragment.append(document.createTextNode(text.slice(lastIndex, offset)));
          const mark = document.createElement("mark");
          mark.className = "search-highlight";
          mark.textContent = match;
          fragment.append(mark);
          lastIndex = offset + match.length;
          return match;
        });
        fragment.append(document.createTextNode(text.slice(lastIndex)));
        node.replaceWith(fragment);
      });
    });
  };

  // Menerapkan filter kategori yang memang sudah ada; pencarian tidak pernah menyembunyikan kartu.
  const applyFilters = () => {
    if (!cards.length) {
      if (searchStatus) searchStatus.textContent = query ? COPY.unavailable : "";
      return;
    }
    let visible = 0;
    cards.forEach((card) => {
      const matchesCategory = category === "semua" || !card.dataset.category || card.dataset.category === category;
      card.classList.toggle("is-filtered-out", !matchesCategory);
      if (matchesCategory) visible += 1;
    });
    const resultCount = document.querySelector("#result-count");
    if (resultCount) resultCount.textContent = `Menampilkan ${visible} destinasi`;
    if (searchStatus) {
      const rawQuery = searchInput?.value.trim() ?? "";
      const matchedCards = query ? cards.filter((card) => haystack.get(card).includes(query)).length : 0;
      searchStatus.textContent = !query
        ? ""
        : matchedCards
          ? `Sorotan aktif pada ${matchedCards} hasil untuk "${rawQuery}"`
          : `Tidak ada teks yang cocok dengan "${rawQuery}".`;
    }
    // Pencarian hanya menambah atau menghapus mark; visibilitas kartu tetap utuh.
    highlightMatches(searchInput?.value ?? "");
  };

  // Membuka atau menutup panel pencarian sekaligus membersihkan state pencarian.
  const setSearch = (open) => {
    if (!searchPanel || !searchToggle) return;
    searchPanel.hidden = !open;
    searchToggle.setAttribute("aria-expanded", String(open));
    searchToggle.setAttribute("aria-label", open ? COPY.searchClose : COPY.searchOpen);
    const icon = searchToggle.querySelector("i");
    if (icon) icon.className = open ? "ph ph-x" : "ph ph-magnifying-glass";
    if (open) { searchInput?.focus(); return; }
    if (searchInput) searchInput.value = "";
    if (searchClear) searchClear.hidden = true;
    query = "";
    applyFilters();
  };

  // Menutup menu mobile setelah navigasi atau saat pengguna mengklik di luar header.
  const closeMenu = () => {
    if (!menuToggle || !nav) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", COPY.menuOpen);
    nav.classList.remove("is-open");
    const icon = menuToggle.querySelector("i");
    if (icon) icon.className = "ph ph-list";
  };
  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const open = menuToggle.getAttribute("aria-expanded") !== "true";
      if (open) setSearch(false);
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? COPY.menuClose : COPY.menuOpen);
      nav.classList.toggle("is-open", open);
      const icon = menuToggle.querySelector("i");
      if (icon) icon.className = open ? "ph ph-x" : "ph ph-list";
    });
    nav.addEventListener("click", (event) => { if (event.target.closest("a")) closeMenu(); });
    window.addEventListener("resize", () => { if (window.innerWidth > 767) closeMenu(); }, { passive: true });
    document.addEventListener("click", (event) => {
      if (nav.classList.contains("is-open") && !header?.contains(event.target)) closeMenu();
    });
  }

  // Event pencarian berlaku sama pada beranda, destinasi, tiket, tentang, dan review.
  searchToggle?.addEventListener("click", () => {
    const open = searchPanel?.hidden !== false;
    if (open) closeMenu();
    setSearch(open);
  });
  searchInput?.addEventListener("input", () => {
    query = normalize(searchInput.value);
    if (searchClear) searchClear.hidden = !searchInput.value;
    applyFilters();
  });
  searchClear?.addEventListener("click", () => { setSearch(false); searchToggle?.focus(); });
  // Submit tidak mengubah posisi halaman; pencarian cukup mempertahankan sorotan yang sedang tampil.
  searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    searchInput?.focus();
  });

  // Filter kategori tiket menggunakan mesin filter global yang sama dengan pencarian.
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      category = button.dataset.filter ?? "semua";
      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      applyFilters();
    });
  });

  // Tombol Escape selalu mengembalikan fokus ke kontrol yang baru saja ditutup.
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (searchPanel && !searchPanel.hidden) { setSearch(false); searchToggle?.focus(); }
    else if (nav?.classList.contains("is-open")) { closeMenu(); menuToggle?.focus(); }
  });

  // Header dan tombol kembali ke atas merespons posisi scroll secara global.
  const syncScrollState = () => {
    if (header) header.dataset.scrolled = String(window.scrollY > 20);
    if (backToTop) {
      const show = window.scrollY > 320;
      backToTop.classList.toggle("is-visible", show);
      backToTop.setAttribute("aria-hidden", String(!show));
      backToTop.tabIndex = show ? 0 : -1;
    }
  };
  window.addEventListener("scroll", syncScrollState, { passive: true });
  backToTop?.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
    header?.querySelector(".brand")?.focus({ preventScroll: true });
  });

  // Inisialisasi state awal setelah seluruh referensi komponen siap digunakan.
  if (searchClear) searchClear.setAttribute("aria-label", COPY.searchClear);
  applyFilters();
  syncScrollState();
})();
