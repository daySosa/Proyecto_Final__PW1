const CART_KEY = 'pattysCart';
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

function updateCartBadge() {
  const cart = getCart();
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = cart.length;
}

function formatMoney(n) {
  return 'L. ' + n.toLocaleString('es-HN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function groupCart(cart) {
  const map = new Map();
  const groups = [];

  cart.forEach(item => {
    const key = item.name + '|' + item.price;
    if (map.has(key)) {
      map.get(key).qty += 1;
    } else {
      const info = PRODUCTOS_POR_NOMBRE[item.name];
      const group = {
        name: item.name,
        price: Number(item.price),
        qty: 1,
        img: info ? info.img : '',
        id: info ? info.id : null
      };
      map.set(key, group);
      groups.push(group);
    }
  });

  return groups;
}

function renderCarrito() {
  const cart = getCart();
  const groups = groupCart(cart);
  const itemsWrap = document.getElementById('carritoItems');
  const emptyState = document.getElementById('carritoVacio');
  const contentState = document.getElementById('carritoConContenido');

  updateCartBadge();

  if (groups.length === 0) {
    emptyState.hidden = false;
    contentState.hidden = true;
    return;
  }

  emptyState.hidden = true;
  contentState.hidden = false;

  itemsWrap.innerHTML = groups.map(item => `
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
  renderResumen(groups);
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

  if (delta > 0) {
    cart.push({ name, price });
  } else {
    const idx = cart.findIndex(i => i.name === name && Number(i.price) === price);
    if (idx !== -1) cart.splice(idx, 1);
  }

  saveCart(cart);
  renderCarrito();
}

function removeItem(name, price) {
  const cart = getCart().filter(i => !(i.name === name && Number(i.price) === price));
  saveCart(cart);
  renderCarrito();
}

function renderResumen(groups) {
  const subtotal = groups.reduce((sum, item) => sum + item.price * item.qty, 0);
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

document.addEventListener('DOMContentLoaded', () => {
  renderCarrito();

  const searchTrigger = document.getElementById('searchTrigger');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchClose = document.getElementById('searchClose');
  if (searchTrigger && searchOverlay) {
    searchTrigger.addEventListener('click', () => searchOverlay.classList.add('open'));
  }
  if (searchClose && searchOverlay) {
    searchClose.addEventListener('click', () => searchOverlay.classList.remove('open'));
  }
  if (searchOverlay) {
    searchOverlay.addEventListener('click', (e) => {
      if (e.target === searchOverlay) searchOverlay.classList.remove('open');
    });
  }

  const burgerBtn = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (burgerBtn && mobileMenu) {
    burgerBtn.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  }

  const moreBtn = document.getElementById('moreBtn');
  const navMore = document.getElementById('navMore');
  if (moreBtn && navMore) {
    moreBtn.addEventListener('click', () => navMore.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (!navMore.contains(e.target)) navMore.classList.remove('open');
    });
  }

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

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