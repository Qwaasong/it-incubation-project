(() => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.primary-nav');
  const searchToggle = document.querySelector('#search-toggle');
  const searchPanel = document.querySelector('#site-search');
  const searchForm = document.querySelector('#search-form');
  const searchInput = document.querySelector('#search-input');
  const searchClear = document.querySelector('#search-clear');
  const searchStatus = document.querySelector('#search-status');
  const filters = [...document.querySelectorAll('.filter-button')];
  // Beranda/Tiket label their cards .destination-card; Destinasi uses .card.
// Either shape is searchable, so the shared navbar search works everywhere.
  const cards = [...document.querySelectorAll('.destination-card, .card')];
  const count = document.querySelector('#result-count');
  const backToTop = document.querySelector('#back-to-top');

  const SCROLL_THRESHOLD = 20;
  const BACK_TO_TOP_THRESHOLD = 320;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scrollBehavior = () => (prefersReducedMotion.matches ? 'auto' : 'smooth');
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: scrollBehavior() });
  const COPY = {
    searchOpen: 'Cari destinasi',
    searchClose: 'Tutup pencarian',
    searchClear: 'Bersihkan pencarian',
    menuOpen: 'Buka menu navigasi',
    menuClose: 'Tutup menu navigasi',
    countPrefix: 'Menampilkan',
    countUnit: 'destinasi',
    result: '{n} hasil untuk "{q}"',
    empty: 'Tidak ada destinasi yang cocok dengan "{q}".',
    unavailable: 'Pencarian destinasi tersedia pada halaman Destinasi dan Tiket.',
  };

  const normalize = (value) => value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  const fill = (template, values) => Object.entries(values)
    .reduce((out, [key, value]) => out.replace(`{${key}}`, value), template);

  let category = 'semua';
  let query = '';

  const haystack = new Map(cards.map((card) => [card, normalize([
    card.querySelector('h3'),
    card.querySelector('.card-location'),
    card.querySelector('.card-description'),
    card.querySelector('.category-pill'),
  ].map((node) => node?.textContent ?? '').join(' '))]));

  const applyFilters = () => {
    if (!cards.length) {
      if (searchStatus) searchStatus.textContent = query ? COPY.unavailable : '';
      return;
    }

    let visible = 0;
    cards.forEach((card) => {
      const matchesCategory = category === 'semua' || card.dataset.category === category;
      const matchesQuery = !query || haystack.get(card).includes(query);
      const show = matchesCategory && matchesQuery;
      card.classList.toggle('is-filtered-out', !show);
      if (show) visible += 1;
    });

    if (count) count.textContent = `${COPY.countPrefix} ${visible} ${COPY.countUnit}`;
    if (searchStatus) {
      searchStatus.textContent = !query
        ? ''
        : visible
          ? fill(COPY.result, { n: visible, q: query })
          : fill(COPY.empty, { q: query });
    }
  };

  const setSearch = (open) => {
    if (!searchPanel || !searchToggle) return;
    searchPanel.hidden = !open;
    searchToggle.setAttribute('aria-expanded', String(open));
    searchToggle.setAttribute('aria-label', open ? COPY.searchClose : COPY.searchOpen);

    if (open) {
      if (searchInput) searchInput.focus();
      return;
    }

    if (searchInput) searchInput.value = '';
    if (searchClear) searchClear.hidden = true;
    query = '';
    applyFilters();
  };

  const closeMenu = () => {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', COPY.menuOpen);
    nav.classList.remove('is-open');
    const icon = toggle.querySelector('i');
    if (icon) icon.className = 'ph ph-list';
  };

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      if (open) setSearch(false);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? COPY.menuClose : COPY.menuOpen);
      nav.classList.toggle('is-open', open);
      const icon = toggle.querySelector('i');
      if (icon) icon.className = open ? 'ph ph-x' : 'ph ph-list';
    });

    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 767) closeMenu();
    }, { passive: true });
  }

  if (searchToggle) {
    searchToggle.addEventListener('click', () => {
      const open = searchPanel?.hidden !== false;
      if (open) closeMenu();
      setSearch(open);
    });
  }

  if (searchForm) {
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      document.getElementById('destinasi')?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      query = normalize(searchInput.value);
      if (searchClear) searchClear.hidden = !searchInput.value;
      applyFilters();
    });
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      setSearch(false);
      searchToggle?.focus();
    });
  }

  filters.forEach((button) => {
    button.addEventListener('click', () => {
      category = button.dataset.filter;
      filters.forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      applyFilters();
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (searchPanel && !searchPanel.hidden) {
      setSearch(false);
      searchToggle?.focus();
      return;
    }
    if (nav?.classList.contains('is-open')) {
      closeMenu();
      toggle.focus();
    }
  });

  const syncScrollState = () => {
    if (header) header.dataset.scrolled = String(window.scrollY > SCROLL_THRESHOLD);
    if (backToTop) {
      const show = window.scrollY > BACK_TO_TOP_THRESHOLD;
      backToTop.classList.toggle('is-visible', show);
      backToTop.setAttribute('aria-hidden', String(!show));
      backToTop.tabIndex = show ? 0 : -1;
    }
  };

  window.addEventListener('scroll', syncScrollState, { passive: true });

  if (backToTop) {
    backToTop.addEventListener('click', (event) => {
      event.preventDefault();
      scrollToTop();
      header?.querySelector('.brand')?.focus({ preventScroll: true });
    });
  }

  // If there's no #destinasi target on the current page (e.g., Review), the
  // search submit should just close the search panel instead of scrolling.
  const hasDestinasiAnchor = document.getElementById('destinasi');
  if (searchForm && !hasDestinasiAnchor) {
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      setSearch(false);
      searchToggle?.focus();
    }, { once: true });
  }

  if (searchClear) searchClear.setAttribute('aria-label', COPY.searchClear);
  applyFilters();
  syncScrollState();
})();
