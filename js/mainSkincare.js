const CART_KEY = 'pattysCart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(name, price) {
  const cart = getCart();
  cart.push({ name: name, price: Number(price) });
  saveCart(cart);
  updateCartBadge();
}

function updateCartBadge() {
  const cart = getCart();
  const total = cart.length;

  const badge = document.getElementById('cartCount');
  if (badge) {
    badge.textContent = total;
  }

  const mainBadge = document.getElementById('cartBadge');
  if (mainBadge) {
    mainBadge.textContent = total;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();

  document.querySelectorAll('.cart-add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const { name, price } = btn.dataset;
      addToCart(name, price);

      const original = btn.textContent;
      btn.textContent = '✓';
      setTimeout(() => { btn.textContent = original; }, 900);
    });
  });

  const searchTrigger = document.getElementById('searchTrigger');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchClose = document.getElementById('searchClose');
  const searchInput = document.getElementById('searchInput');

  function openSearch() {
    searchOverlay.classList.add('open');
    searchTrigger.setAttribute('aria-expanded', 'true');
    setTimeout(() => searchInput && searchInput.focus(), 50);
  }

  function closeSearch() {
    searchOverlay.classList.remove('open');
    searchTrigger.setAttribute('aria-expanded', 'false');
  }

  if (searchTrigger && searchOverlay) {
    searchTrigger.addEventListener('click', () => {
      searchOverlay.classList.contains('open') ? closeSearch() : openSearch();
    });
  }
  if (searchClose && searchOverlay) {
    searchClose.addEventListener('click', closeSearch);
  }
  if (searchOverlay) {
    searchOverlay.addEventListener('click', (e) => {
      if (e.target === searchOverlay) closeSearch();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && searchOverlay.classList.contains('open')) closeSearch();
    });
  }

  const moreBtn = document.getElementById('moreBtn');
  const navMore = document.getElementById('navMore');
  if (moreBtn && navMore) {
    moreBtn.addEventListener('click', () => navMore.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (!navMore.contains(e.target)) navMore.classList.remove('open');
    });
  }

  const burgerBtn = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (burgerBtn && mobileMenu) {
    burgerBtn.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  }

  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  const form = document.getElementById('newsletterFormSkincare');
  if (form) {
    const emailInput = document.getElementById('newsletterEmailSkincare');
    const errorSpan = document.getElementById('newsletterErrorSkincare');
    const successMsg = document.getElementById('newsletterSuccessSkincare');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const value = emailInput.value.trim();
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

      if (!isValid) {
        emailInput.classList.add('invalid');
        errorSpan.textContent = 'Por favor ingresa un correo electrónico válido.';
        successMsg.classList.remove('show');
        return;
      }

      emailInput.classList.remove('invalid');
      errorSpan.textContent = '';
      successMsg.textContent = '¡Gracias por suscribirte, ' + value + '!';
      successMsg.classList.add('show');
      form.reset();
    });
  }
});

const skincareFilters = document.getElementById('skincareFilters');
if (skincareFilters) {
  const filters = skincareFilters.querySelectorAll('.filter-chip');
  const cards = document.querySelectorAll('#skincareGrid .product-card');
  const emptyMsg = document.getElementById('skincareEmpty');

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;
      let visibleCount = 0;

      cards.forEach(card => {
        const match = filter === 'todos' || card.dataset.category === filter;
        card.style.display = match ? '' : 'none';
        if (match) visibleCount++;
      });

      if (emptyMsg) emptyMsg.hidden = visibleCount > 0;
    });
  });
}