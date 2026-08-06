document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initMoreMenu();
  initHeaderShadow();
  initNewsletterForm();
  initAddToCart();
  setCurrentYear();
  updateCartBadge();
});

function initMobileMenu() {
  const burger = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!burger || !mobileMenu) return;

  burger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}

function initMoreMenu() {
  const navMore = document.getElementById('navMore');
  const moreBtn = document.getElementById('moreBtn');
  if (!navMore || !moreBtn) return;

  moreBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navMore.classList.toggle('open');
    moreBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  document.addEventListener('click', (e) => {
    if (!navMore.contains(e.target)) {
      navMore.classList.remove('open');
      moreBtn.setAttribute('aria-expanded', 'false');
    }
  });

  navMore.querySelectorAll('.more-menu a').forEach(link => {
    link.addEventListener('click', () => {
      navMore.classList.remove('open');
      moreBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

function initHeaderShadow() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  });
}

function initNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  const emailInput = document.getElementById('newsletterEmail');
  const errorSpan = document.getElementById('newsletterError');
  const successMsg = document.getElementById('newsletterSuccess');
  if (!form || !emailInput || !errorSpan || !successMsg) return;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  emailInput.addEventListener('input', () => {
    emailInput.classList.remove('invalid');
    errorSpan.textContent = '';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = emailInput.value.trim();

    if (value === '') {
      emailInput.classList.add('invalid');
      errorSpan.textContent = 'Por favor, ingresa tu correo electrónico.';
      successMsg.classList.remove('show');
      return;
    }

    if (!emailPattern.test(value)) {
      emailInput.classList.add('invalid');
      errorSpan.textContent = 'Ingresa un correo electrónico válido (ej. usuario@dominio.com).';
      successMsg.classList.remove('show');
      return;
    }

    emailInput.classList.remove('invalid');
    errorSpan.textContent = '';
    successMsg.textContent = '¡Gracias por suscribirte! Te hemos enviado tu cupón del 10% de descuento.';
    successMsg.classList.add('show');
    form.reset();
  });
}

function initAddToCart() {
  const buttons = document.querySelectorAll('.add-btn');
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.product || 'Producto';
      const price = Number(btn.dataset.price) || 0;

      const cart = getCart();
      const existing = cart.find(item => item.name === name);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ name, price, qty: 1 });
      }
      saveCart(cart);
      updateCartBadge();

      const originalText = btn.textContent;
      btn.textContent = '¡Añadido!';
      btn.style.opacity = '0.85';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.opacity = '';
      }, 1200);
    });
  });
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem('pattysCartV1')) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('pattysCartV1', JSON.stringify(cart));
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const cart = getCart();
  const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
  badge.textContent = totalQty;
}

function setCurrentYear() {
  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();
}