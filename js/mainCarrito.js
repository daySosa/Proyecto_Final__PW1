const CART_KEY = 'pattysCartV1';
const ENVIO_COSTO = 60;
const ENVIO_GRATIS_DESDE = 1000;

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
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

  const badge = document.getElementById('cartCount');
  if (badge) {
    badge.textContent = totalQty;
  }

  const mobileCount = document.getElementById('cartCountMobile');
  if (mobileCount) mobileCount.textContent = totalQty;
}

function formatMoney(n) {
  return 'L. ' + n.toLocaleString('es-HN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function renderCarrito() {
  const cart = getCart();
  const itemsWrap = document.getElementById('carritoItems');
  const emptyState = document.getElementById('carritoVacio');
  const contentState = document.getElementById('carritoConContenido');

  updateCartBadge();

  if (cart.length === 0) {
    emptyState.hidden = false;
    contentState.hidden = true;
    return;
  }

  emptyState.hidden = true;
  contentState.hidden = false;

  itemsWrap.innerHTML = cart.map(item => `
    <article class="carrito-item" data-id="${item.id}">
      <div class="carrito-item-img"><img src="${item.img}" alt="${item.name}"></div>
      <div class="carrito-item-info">
        <h3><a href="producto.html?id=${item.id}">${item.name}</a></h3>
        <p class="carrito-item-precio-unit">${formatMoney(item.price)} c/u</p>
        <div class="carrito-item-controls">
          <div class="carrito-cantidad">
            <button type="button" class="qty-menos" aria-label="Reducir cantidad de ${item.name}">−</button>
            <span>${item.qty}</span>
            <button type="button" class="qty-mas" aria-label="Aumentar cantidad de ${item.name}">+</button>
          </div>
          <button type="button" class="carrito-remove" aria-label="Quitar ${item.name} del carrito">Quitar</button>
        </div>
      </div>
      <div class="carrito-item-subtotal">${formatMoney(item.price * item.qty)}</div>
    </article>
  `).join('');

  attachItemEvents();
  renderResumen(cart);
}

function attachItemEvents() {
  document.querySelectorAll('.carrito-item').forEach(el => {
    const id = el.dataset.id;

    el.querySelector('.qty-menos').addEventListener('click', () => changeQty(id, -1));
    el.querySelector('.qty-mas').addEventListener('click', () => changeQty(id, 1));
    el.querySelector('.carrito-remove').addEventListener('click', () => removeItem(id));
  });
}

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.qty = Math.max(1, item.qty + delta);
  saveCart(cart);
  renderCarrito();
}

function removeItem(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  renderCarrito();
}

function renderResumen(cart) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
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

  // ---------- Header compartido ----------
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