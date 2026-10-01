(() => {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.primary-nav');
  const searchToggle = document.querySelector('#search-toggle');
  const searchPanel = document.querySelector('#site-search');
  const searchForm = document.querySelector('#search-form');
  const searchInput = document.querySelector('#search-input');
  const searchClear = document.querySelector('#search-clear');
  const searchStatus = document.querySelector('#search-status');
  const backToTop = document.querySelector('#back-to-top');
  const filterButtons = [...document.querySelectorAll('.filter-button')];
  const cards = [...document.querySelectorAll('.destination-card, .card')];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scrollBehavior = () => prefersReducedMotion.matches ? 'auto' : 'smooth';
  const COPY = {
    searchOpen: 'Cari destinasi',
    searchClose: 'Tutup pencarian',
    menuOpen: 'Buka menu navigasi',
    menuClose: 'Tutup menu navigasi',
    unavailable: 'Pencarian destinasi tersedia pada halaman Beranda, Destinasi, dan Tiket.',
  };

  const normalize = (value) => value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  const haystack = new Map(cards.map((card) => [card, normalize([
    card.dataset.name,
    card.dataset.category,
    card.querySelector('h3'),
    card.querySelector('.card-location, .location'),
    card.querySelector('.card-description, .destination-info p, .card-content p'),
    card.querySelector('.category-pill, .destination-tag'),
  ].map((item) => typeof item === 'string' ? item : item?.textContent ?? '').join(' '))]));

  let category = filterButtons.find((button) => button.getAttribute('aria-pressed') === 'true')?.dataset.filter ?? 'semua';
  let query = '';

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

    const resultCount = document.querySelector('#result-count');
    if (resultCount) resultCount.textContent = `Menampilkan ${visible} destinasi`;
    if (searchStatus) {
      searchStatus.textContent = !query
        ? ''
        : visible
          ? `${visible} hasil untuk "${searchInput?.value.trim() ?? ''}"`
          : `Tidak ada destinasi yang cocok dengan "${searchInput?.value.trim() ?? ''}".`;
    }
  };

  const setSearch = (open) => {
    if (!searchPanel || !searchToggle) return;
    searchPanel.hidden = !open;
    searchToggle.setAttribute('aria-expanded', String(open));
    searchToggle.setAttribute('aria-label', open ? COPY.searchClose : COPY.searchOpen);
    const icon = searchToggle.querySelector('i');
    if (icon) icon.className = open ? 'ph ph-x' : 'ph ph-magnifying-glass';

    if (open) {
      searchInput?.focus();
      return;
    }

    if (searchInput) searchInput.value = '';
    if (searchClear) searchClear.hidden = true;
    query = '';
    applyFilters();
  };

  const closeMenu = () => {
    if (!menuToggle || !nav) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', COPY.menuOpen);
    nav.classList.remove('is-open');
    const icon = menuToggle.querySelector('i');
    if (icon) icon.className = 'ph ph-list';
  };

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') !== 'true';
      if (open) setSearch(false);
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? COPY.menuClose : COPY.menuOpen);
      nav.classList.toggle('is-open', open);
      const icon = menuToggle.querySelector('i');
      if (icon) icon.className = open ? 'ph ph-x' : 'ph ph-list';
    });

    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 767) closeMenu();
    }, { passive: true });

    document.addEventListener('click', (event) => {
      if (nav.classList.contains('is-open') && !header?.contains(event.target)) closeMenu();
    });
  }

  searchToggle?.addEventListener('click', () => {
    const open = searchPanel?.hidden !== false;
    if (open) closeMenu();
    setSearch(open);
  });

  searchInput?.addEventListener('input', () => {
    query = normalize(searchInput.value);
    if (searchClear) searchClear.hidden = !searchInput.value;
    applyFilters();
  });

  searchClear?.addEventListener('click', () => {
    setSearch(false);
    searchToggle?.focus();
  });

  searchForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const target = document.querySelector('#destinasi');
    if (target) {
      target.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    } else {
      setSearch(false);
      searchToggle?.focus();
    }
  });

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      category = button.dataset.filter ?? 'semua';
      filterButtons.forEach((item) => {
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
    } else if (nav?.classList.contains('is-open')) {
      closeMenu();
      menuToggle?.focus();
    }
  });

  const syncScrollState = () => {
    if (header) header.dataset.scrolled = String(window.scrollY > 20);
    if (backToTop) {
      const show = window.scrollY > 320;
      backToTop.classList.toggle('is-visible', show);
      backToTop.setAttribute('aria-hidden', String(!show));
      backToTop.tabIndex = show ? 0 : -1;
    }
  };

  window.addEventListener('scroll', syncScrollState, { passive: true });
  backToTop?.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
    header?.querySelector('.brand')?.focus({ preventScroll: true });
  });

  applyFilters();
  syncScrollState();
})();
