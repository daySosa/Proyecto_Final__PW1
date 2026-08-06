const CART_KEY = 'pattysCartV1';
const ENVIO_COSTO = 60;
const ENVIO_GRATIS_DESDE = 1000;

const PRODUCTOS = Object.assign(
  {},
  window.PRODUCTOS_MAQUILLAJE || {},
  window.PRODUCTOS_ROPA || {},
  window.PRODUCTOS_ACCESORIOS || {},
  window.PRODUCTOS_SKINCARE || {}
);

const PRODUCTOS_POR_NOMBRE = {};
Object.entries(PRODUCTOS).forEach(([id, p]) => {
  PRODUCTOS_POR_NOMBRE[p.nombre] = { id, img: p.img };
});

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

function cartTotalQty(cart) {
  return cart.reduce((sum, item) => sum + (item.qty || 1), 0);
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  badge.textContent = cartTotalQty(getCart());
}

function formatMoney(n) {
  return 'L. ' + n.toLocaleString('es-HN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function enrichCart(cart) {
  return cart.map(item => {
    const info = PRODUCTOS_POR_NOMBRE[item.name];
    return {
      name: item.name,
      price: Number(item.price),
      qty: item.qty || 1,
      img: info ? info.img : '',
      id: info ? info.id : null
    };
  });
}

function renderCarrito() {
  const items = enrichCart(getCart());
  const itemsWrap = document.getElementById('carritoItems');
  const emptyState = document.getElementById('carritoVacio');
  const contentState = document.getElementById('carritoConContenido');

  updateCartBadge();

  if (items.length === 0) {
    emptyState.hidden = false;
    contentState.hidden = true;
    return;
  }

  emptyState.hidden = true;
  contentState.hidden = false;

  itemsWrap.innerHTML = items.map(item => `
    <article class="carrito-item" data-name="${escapeAttr(item.name)}" data-price="${item.price}">
      <div class="carrito-item-img">
        ${item.img
      ? `<img src="${item.img}" alt="${escapeAttr(item.name)}">`
      : `<div class="carrito-item-img-placeholder" aria-hidden="true">🛍️</div>`}
      </div>
      <div class="carrito-item-info">
        <h3>${item.id ? `<a href="producto.html?id=${item.id}">${item.name}</a>` : item.name}</h3>
        <p class="carrito-item-precio-unit">${formatMoney(item.price)} c/u</p>
        <div class="carrito-item-controls">
          <div class="carrito-cantidad">
            <button type="button" class="qty-menos" aria-label="Reducir cantidad de ${escapeAttr(item.name)}">−</button>
            <span>${item.qty}</span>
            <button type="button" class="qty-mas" aria-label="Aumentar cantidad de ${escapeAttr(item.name)}">+</button>
          </div>
          <button type="button" class="carrito-remove" aria-label="Quitar ${escapeAttr(item.name)} del carrito">Quitar</button>
        </div>
      </div>
      <div class="carrito-item-subtotal">${formatMoney(item.price * item.qty)}</div>
    </article>
  `).join('');

  attachItemEvents();
  renderResumen(items);
}

function escapeAttr(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function attachItemEvents() {
  document.querySelectorAll('.carrito-item').forEach(el => {
    const name = el.dataset.name;
    const price = Number(el.dataset.price);

    el.querySelector('.qty-menos').addEventListener('click', () => changeQty(name, price, -1));
    el.querySelector('.qty-mas').addEventListener('click', () => changeQty(name, price, 1));
    el.querySelector('.carrito-remove').addEventListener('click', () => removeItem(name, price));
  });
}

function changeQty(name, price, delta) {
  const cart = getCart();
  const item = cart.find(i => i.name === name && Number(i.price) === price);
  if (!item) return;

  item.qty = (item.qty || 1) + delta;

  if (item.qty <= 0) {
    cart.splice(cart.indexOf(item), 1);
  }

  saveCart(cart);
  renderCarrito();
}

function removeItem(name, price) {
  const cart = getCart().filter(i => !(i.name === name && Number(i.price) === price));
  saveCart(cart);
  renderCarrito();
}

function renderResumen(items) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const envioGratis = subtotal >= ENVIO_GRATIS_DESDE;
  const envio = envioGratis ? 0 : ENVIO_COSTO;
  const total = subtotal + envio;

  document.getElementById('resumenSubtotal').textContent = formatMoney(subtotal);

  const envioFila = document.getElementById('resumenEnvio');
  envioFila.textContent = envioGratis ? 'Gratis' : formatMoney(envio);
  envioFila.parentElement.classList.toggle('envio-gratis', envioGratis);

  const nota = document.getElementById('resumenEnvioNota');
  if (envioGratis) {
    nota.textContent = '¡Tu pedido califica para envío gratis!';
  } else {
    const faltante = ENVIO_GRATIS_DESDE - subtotal;
    nota.textContent = `Agrega ${formatMoney(faltante)} más para envío gratis.`;
  }

  document.getElementById('resumenTotal').textContent = formatMoney(total);
}

function initMobileMenu() {
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!burgerBtn || !mobileMenu) return;

  burgerBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    burgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      burgerBtn.setAttribute('aria-expanded', 'false');
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

function setCurrentYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', () => {
  renderCarrito();
  initMobileMenu();
  initMoreMenu();
  initHeaderShadow();
  setCurrentYear();

  const vaciarBtn = document.getElementById('carritoVaciarBtn');
  if (vaciarBtn) {
    vaciarBtn.addEventListener('click', () => {
      saveCart([]);
      renderCarrito();
    });
  }

  const checkoutBtn = document.getElementById('irCheckoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      window.location.href = 'checkout.html';
    });
  }
});