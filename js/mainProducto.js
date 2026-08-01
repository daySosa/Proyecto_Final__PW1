const CART_KEY = 'pattysCartV1';

// Metadatos de cada línea de producto: a qué catálogo pertenece
// y cómo se llama la segunda pestaña de información.
const CATALOGOS = {
  maquillaje: { label: 'Maquillaje', href: 'maquillaje.html', tabExtra: 'Modo de uso' },
  ropa: { label: 'Ropa', href: 'ropa.html', tabExtra: 'Guía de tallas y cuidado' },
  accesorios: { label: 'Accesorios', href: 'accesorios.html', tabExtra: 'Cuidado y materiales' },
  skincare: { label: 'Skincare', href: 'skincare.html', tabExtra: 'Modo de uso' }
};

// Combina las 4 fuentes de datos (cada una cargada por su propio <script>)
const PRODUCTOS = Object.assign(
  {},
  window.PRODUCTOS_MAQUILLAJE || {},
  window.PRODUCTOS_ROPA || {},
  window.PRODUCTOS_ACCESORIOS || {},
  window.PRODUCTOS_SKINCARE || {}
);

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

function addToCart(id, name, price, img, qty) {
  const cart = getCart();
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id, name, price: Number(price), img, qty });
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

// ---------- Galería de imágenes (soporta 1 o varias imágenes) ----------
function renderGaleria(producto) {
  const mainImg = document.getElementById('productoImg');
  const thumbsWrap = document.getElementById('productoThumbs');
  const imagenes = producto.imagenes && producto.imagenes.length ? producto.imagenes : [producto.img];

  mainImg.src = imagenes[0];
  mainImg.alt = producto.nombre;

  if (imagenes.length <= 1) {
    thumbsWrap.hidden = true;
    return;
  }

  thumbsWrap.hidden = false;
  thumbsWrap.innerHTML = imagenes.map((src, i) => `
    <button class="producto-thumb${i === 0 ? ' active' : ''}" data-src="${src}" aria-label="Ver imagen ${i + 1} de ${producto.nombre}">
      <img src="${src}" alt="">
    </button>
  `).join('');

  thumbsWrap.querySelectorAll('.producto-thumb').forEach(btn => {
    btn.addEventListener('click', () => {
      thumbsWrap.querySelectorAll('.producto-thumb').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      mainImg.src = btn.dataset.src;
    });
  });
}

// ---------- Productos relacionados: misma subcategoría primero, misma línea después ----------
function renderRelacionados(idActual, producto) {
  const grid = document.getElementById('relacionadosGrid');
  const wrap = document.getElementById('relacionadosWrap');
  if (!grid || !wrap) return;

  const mismaCategoria = Object.entries(PRODUCTOS)
    .filter(([id, p]) => id !== idActual && p.linea === producto.linea && p.categoria === producto.categoria);

  const mismaLinea = Object.entries(PRODUCTOS)
    .filter(([id, p]) => id !== idActual && p.linea === producto.linea && p.categoria !== producto.categoria);

  const relacionados = mismaCategoria.concat(mismaLinea).slice(0, 3);

  if (relacionados.length === 0) {
    wrap.hidden = true;
    return;
  }

  grid.innerHTML = relacionados.map(([id, p]) => `
    <article class="product-card">
      <a href="producto.html?id=${id}">
        <div class="product-img"><img src="${p.img}" alt="${p.nombre}"></div>
      </a>
      <div class="product-info">
        <span class="product-tag">${p.categoria}</span>
        <h4>${p.nombre}</h4>
        <div class="product-price">
          <strong>L. ${p.precio}</strong>
          <button class="add-btn cart-add-btn" data-id="${id}" data-name="${p.nombre}" data-price="${p.precio}" data-img="${p.img}" aria-label="Agregar ${p.nombre} al carrito">+</button>
        </div>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('.cart-add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const { id, name, price, img } = btn.dataset;
      addToCart(id, name, price, img, 1);
    });
  });

  wrap.hidden = false;
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();

  // ---------- Header compartido: buscador, menú "Más", menú móvil ----------
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

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Cargar el producto según ?id= ----------
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const producto = id ? PRODUCTOS[id] : null;

  const contenido = document.getElementById('productoContenido');
  const tabsWrap = document.getElementById('productoTabsWrap');
  const noEncontrado = document.getElementById('productoNoEncontrado');

  if (!producto) {
    if (noEncontrado) noEncontrado.hidden = false;
    return;
  }

  const catalogo = CATALOGOS[producto.linea] || { label: producto.linea, href: 'index.html', tabExtra: 'Detalles' };

  document.title = producto.nombre + " — Patty's Store";

  // Breadcrumb dinámico
  const breadcrumbCategoria = document.getElementById('breadcrumbCategoria');
  const breadcrumbNombre = document.getElementById('breadcrumbNombre');
  if (breadcrumbCategoria) {
    breadcrumbCategoria.textContent = catalogo.label;
    breadcrumbCategoria.href = catalogo.href;
  }
  if (breadcrumbNombre) breadcrumbNombre.textContent = producto.nombre;

  // Volver al catálogo correcto
  const volverLink = document.getElementById('productoVolver');
  if (volverLink) {
    volverLink.href = catalogo.href;
    volverLink.textContent = '← Volver a ' + catalogo.label;
  }

  renderGaleria(producto);

  document.getElementById('productoCategoria').textContent = producto.categoria;
  document.getElementById('productoNombre').textContent = producto.nombre;
  document.getElementById('productoPrecio').textContent = 'L. ' + producto.precio;
  document.getElementById('productoDescripcion').textContent = producto.descripcion;
  document.getElementById('productoSku').textContent = 'PS-' + id.toUpperCase();
  document.getElementById('productoTags').textContent = catalogo.label + ' · ' + producto.categoria;
  document.getElementById('tabDescripcion').textContent = producto.descripcion;
  document.getElementById('tabUso').textContent = producto.detalle;
  document.getElementById('tabUsoLabel').textContent = catalogo.tabExtra;

  contenido.hidden = false;
  tabsWrap.hidden = false;

  // Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      document.getElementById('tab' + btn.dataset.tab.charAt(0).toUpperCase() + btn.dataset.tab.slice(1)).classList.add('active');
    });
  });

  // Cantidad
  const cantidadInput = document.getElementById('productoCantidad');
  document.getElementById('cantidadMenos').addEventListener('click', () => {
    const actual = parseInt(cantidadInput.value, 10) || 1;
    cantidadInput.value = Math.max(1, actual - 1);
  });
  document.getElementById('cantidadMas').addEventListener('click', () => {
    const actual = parseInt(cantidadInput.value, 10) || 1;
    cantidadInput.value = actual + 1;
  });

  const agregadoMsg = document.getElementById('productoAgregadoMsg');

  document.getElementById('productoAgregarBtn').addEventListener('click', () => {
    const qty = parseInt(cantidadInput.value, 10) || 1;
    addToCart(id, producto.nombre, producto.precio, producto.img, qty);
    agregadoMsg.hidden = false;
    setTimeout(() => { agregadoMsg.hidden = true; }, 2500);
  });

  document.getElementById('productoComprarBtn').addEventListener('click', () => {
    const qty = parseInt(cantidadInput.value, 10) || 1;
    addToCart(id, producto.nombre, producto.precio, producto.img, qty);
    window.location.href = 'carrito.html';
  });

  renderRelacionados(id, producto);
});