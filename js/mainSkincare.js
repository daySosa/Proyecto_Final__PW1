const CART_KEY = 'pattysCartV1';

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(id, name, price, img) {
  const cart = getCart();
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price: Number(price), img, qty: 1 });
  }
  saveCart(cart);
  updateCartBadge();
}

function updateCartBadge() {
  const cart = getCart();
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

  const badge = document.getElementById('cartCount');
  if (badge) {
    badge.textContent = totalQty;
    badge.hidden = totalQty === 0;
  }

  const mobileCount = document.getElementById('cartCountMobile');
  if (mobileCount) {
    mobileCount.textContent = totalQty;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();

  document.querySelectorAll('.cart-add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const { id, name, price, img } = btn.dataset;
      addToCart(id, name, price, img);
    });
  });

  const searchTrigger = document.getElementById('searchTrigger');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchClose = document.getElementById('searchClose');
  if (searchTrigger && searchOverlay) {
    searchTrigger.addEventListener('click', () => searchOverlay.classList.add('open'));
  }
  if (searchClose && searchOverlay) {
    searchClose.addEventListener('click', () => searchOverlay.classList.remove('open'));
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