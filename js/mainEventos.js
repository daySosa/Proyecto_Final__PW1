// ============================================================
// Eventos.html — lógica específica de la página de Eventos
// (El header, buscador y menú móvil los maneja js/main.js,
// compartido por todas las páginas del sitio)
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
  initHeaderScroll();
  initBurgerMenu();
  initMoreMenu();
  initSearchOverlay();
  initEventCountdown();
  initEventFilters();
  initEventsNewsletter();
  fillYearFallback();
});

// ---------- Sombra del header al hacer scroll ----------
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

// ---------- Cuenta regresiva del próximo evento ----------
function initEventCountdown() {
  const box = document.getElementById('eventCountdown');
  if (!box) return;

  const target = new Date(box.dataset.datetime).getTime();
  const elDays = document.getElementById('cdDays');
  const elHours = document.getElementById('cdHours');
  const elMinutes = document.getElementById('cdMinutes');
  const elSeconds = document.getElementById('cdSeconds');

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function tick() {
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      elDays.textContent = '00';
      elHours.textContent = '00';
      elMinutes.textContent = '00';
      elSeconds.textContent = '00';
      clearInterval(timer);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    elDays.textContent = pad(days);
    elHours.textContent = pad(hours);
    elMinutes.textContent = pad(minutes);
    elSeconds.textContent = pad(seconds);
  }

  tick();
  const timer = setInterval(tick, 1000);
}

// ---------- Filtro de eventos por categoría ----------
function initEventFilters() {
  const filterBar = document.getElementById('eventsFilters');
  const grid = document.getElementById('eventsGrid');
  const emptyMsg = document.getElementById('eventsEmpty');
  if (!filterBar || !grid) return;

  const chips = filterBar.querySelectorAll('.filter-chip');
  const cards = grid.querySelectorAll('.blog-card');

  filterBar.addEventListener('click', function (e) {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;

    chips.forEach(function (c) {
      c.classList.remove('active');
      c.setAttribute('aria-selected', 'false');
    });
    chip.classList.add('active');
    chip.setAttribute('aria-selected', 'true');

    const filter = chip.dataset.filter;
    let visibleCount = 0;

    cards.forEach(function (card) {
      const categories = (card.dataset.category || '').split(' ');
      const matches = filter === 'todos' || categories.indexOf(filter) !== -1;
      card.hidden = !matches;
      if (matches) visibleCount++;
    });

    if (emptyMsg) emptyMsg.hidden = visibleCount !== 0;
  });
}

// ---------- Formulario de newsletter de eventos ----------
function initEventsNewsletter() {
  const form = document.getElementById('newsletterFormEventos');
  if (!form) return;

  const input = document.getElementById('newsletterEmailEventos');
  const error = document.getElementById('newsletterErrorEventos');
  const success = document.getElementById('newsletterSuccessEventos');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const email = input.value.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValid) {
      input.classList.add('invalid');
      error.textContent = 'Ingresa un correo electrónico válido.';
      success.classList.remove('show');
      return;
    }

    input.classList.remove('invalid');
    error.textContent = '';
    success.textContent = '¡Listo! Te avisaremos antes de cada evento.';
    success.classList.add('show');
    form.reset();
  });

  input.addEventListener('input', function () {
    if (input.classList.contains('invalid')) {
      input.classList.remove('invalid');
      error.textContent = '';
    }
  });
}

// ---------- Respaldo por si main.js no define el año ----------
function fillYearFallback() {
  const yearEl = document.getElementById('year');
  if (yearEl && !yearEl.textContent.trim()) {
    yearEl.textContent = new Date().getFullYear();
  }
}