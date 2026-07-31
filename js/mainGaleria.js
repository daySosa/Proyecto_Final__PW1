document.addEventListener('DOMContentLoaded', function () {
  initHeaderScroll();
  initBurgerMenu();
  initMoreMenu();
  initSearchOverlay();
  initGalleryFilters();
  initLightbox();
  fillYearFallback();
});

function initHeaderScroll() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }
  onScroll();
  window.addEventListener('scroll', onScroll);
}

// ---------- Menú hamburguesa (móvil) ----------
function initBurgerMenu() {
  const burger = document.getElementById('burgerBtn');
  const menu = document.getElementById('mobileMenu');
  if (!burger || !menu) return;

  burger.addEventListener('click', function () {
    const isOpen = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(isOpen));
  });
}

// ---------- Menú "Más" (desplegable) ----------
function initMoreMenu() {
  const navMore = document.getElementById('navMore');
  const moreBtn = document.getElementById('moreBtn');
  if (!navMore || !moreBtn) return;

  moreBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    const isOpen = navMore.classList.toggle('open');
    moreBtn.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', function (e) {
    if (!navMore.contains(e.target)) {
      navMore.classList.remove('open');
      moreBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

// ---------- Overlay de búsqueda ----------
function initSearchOverlay() {
  const trigger = document.getElementById('searchTrigger');
  const overlay = document.getElementById('searchOverlay');
  const closeBtn = document.getElementById('searchClose');
  const input = document.getElementById('searchInput');
  if (!trigger || !overlay || !closeBtn) return;

  function openOverlay() {
    overlay.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
    if (input) input.focus();
  }

  function closeOverlay() {
    overlay.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
  }

  trigger.addEventListener('click', openOverlay);
  closeBtn.addEventListener('click', closeOverlay);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeOverlay();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeOverlay();
  });
}

// ---------- Filtro de fotos por categoría ----------
function initGalleryFilters() {
  const filterBar = document.getElementById('galleryFilters');
  const grid = document.getElementById('galleryGrid');
  const emptyMsg = document.getElementById('galleryEmpty');
  if (!filterBar || !grid) return;

  const chips = filterBar.querySelectorAll('.filter-chip');

  filterBar.addEventListener('click', function (e) {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;

    chips.forEach(function (c) {
      c.classList.remove('active');
      c.setAttribute('aria-selected', 'false');
    });
    chip.classList.add('active');
    chip.setAttribute('aria-selected', 'true');

    applyGalleryFilter(chip.dataset.filter);

    const emptyMsgEl = document.getElementById('galleryEmpty');
    const anyVisible = Array.prototype.some.call(
      grid.querySelectorAll('.gallery-item'),
      function (item) { return !item.hidden; }
    );
    if (emptyMsgEl) emptyMsgEl.hidden = anyVisible;
  });
}

function applyGalleryFilter(filter) {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;
  const items = grid.querySelectorAll('.gallery-item');

  items.forEach(function (item) {
    const matches = filter === 'todos' || item.dataset.category === filter;
    item.hidden = !matches;
  });
}

// ---------- Lightbox ----------
function initLightbox() {
  const grid = document.getElementById('galleryGrid');
  const overlay = document.getElementById('lightboxOverlay');
  const imageEl = document.getElementById('lightboxImage');
  const captionEl = document.getElementById('lightboxCaption');
  const counterEl = document.getElementById('lightboxCounter');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  if (!grid || !overlay || !imageEl) return;

  const allItems = Array.prototype.slice.call(grid.querySelectorAll('.gallery-item'));
  let currentIndex = -1;

  function getVisibleItems() {
    return allItems.filter(function (item) { return !item.hidden; });
  }

  function openAt(item) {
    const visible = getVisibleItems();
    currentIndex = visible.indexOf(item);
    if (currentIndex === -1) return;
    render(visible);
    overlay.classList.add('open');
  }

  function render(visible) {
    const item = visible[currentIndex];
    imageEl.src = item.dataset.full || item.querySelector('img').src;
    imageEl.alt = item.querySelector('img').alt;
    captionEl.textContent = item.dataset.caption || '';
    counterEl.textContent = (currentIndex + 1) + ' / ' + visible.length;
  }

  function close() {
    overlay.classList.remove('open');
  }

  function step(delta) {
    const visible = getVisibleItems();
    if (!visible.length) return;
    currentIndex = (currentIndex + delta + visible.length) % visible.length;
    render(visible);
  }

  grid.addEventListener('click', function (e) {
    const item = e.target.closest('.gallery-item');
    if (item) openAt(item);
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', function () { step(-1); });
  nextBtn.addEventListener('click', function () { step(1); });

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });

  document.addEventListener('keydown', function (e) {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
}

function fillYearFallback() {
  const yearEl = document.getElementById('year');
  if (yearEl && !yearEl.textContent.trim()) {
    yearEl.textContent = new Date().getFullYear();
  }
}