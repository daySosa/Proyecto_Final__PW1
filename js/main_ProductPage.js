document.addEventListener('DOMContentLoaded', function () {
  initMobileMenu();
  initMoreMenu();
  initHeaderShadow();
  setCurrentYear();
  initSearch();
  updateCartBadge();
  initProductDetail();
});

const CART_KEY = 'pattysCart';

const CATALOGOS = {
  maquillaje: { label: 'Maquillaje', href: 'makeup.html', tabExtra: 'Modo de uso' },
  ropa:       { label: 'Ropa',       href: 'clothes.html', tabExtra: 'Guía de tallas y cuidado' },
  accesorios: { label: 'Accesorios', href: 'accessories.html', tabExtra: 'Cuidado y materiales' },
  skincare:   { label: 'Skincare',   href: 'skincare.html', tabExtra: 'Modo de uso' }
};

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

function addToCart(name, price, qty) {
  const cart = getCart();
  for (let i = 0; i < qty; i++) {
    cart.push({ name, price: Number(price) });
  }
  saveCart(cart);
  updateCartBadge();
}

function updateCartBadge() {
  const cart = getCart();
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = cart.length;
}

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

  moreBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = navMore.classList.toggle('open');
    moreBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  document.addEventListener('click', (event) => {
    if (!navMore.contains(event.target)) {
      navMore.classList.remove('open');
      moreBtn.setAttribute('aria-expanded', 'false');
    }
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

function initSearch() {
  const trigger = document.getElementById('searchTrigger');
  const overlay = document.getElementById('searchOverlay');
  const closeBtn = document.getElementById('searchClose');
  const input = document.getElementById('searchInput');
  const resultsBox = document.getElementById('searchResults');
  if (!trigger || !overlay || !input || !resultsBox) return;

  const index = buildSearchIndex();

  function openSearch() {
    overlay.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    setTimeout(() => input.focus(), 50);
  }

  function closeSearch() {
    overlay.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  trigger.addEventListener('click', () => {
    overlay.classList.contains('open') ? closeSearch() : openSearch();
  });

  closeBtn.addEventListener('click', closeSearch);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeSearch();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && overlay.classList.contains('open')) closeSearch();
  });

  input.addEventListener('input', () => renderResults(input.value.trim()));

  function renderResults(query) {
    if (query === '') {
      resultsBox.innerHTML = '<p class="search-hint">Escribe para buscar en maquillaje, ropa, accesorios y cuidado personal.</p>';
      return;
    }

    const q = normalize(query);
    const matches = index.filter(item => item.searchText.indexOf(q) !== -1);

    if (matches.length === 0) {
      resultsBox.innerHTML = '<p class="search-empty">No encontramos resultados para "' + escapeHtml(query) + '". Prueba con otra palabra.</p>';
      return;
    }

    resultsBox.innerHTML = '';
    matches.forEach(item => {
      const row = document.createElement('div');
      row.className = 'search-result-item';
      row.innerHTML =
        '<div class="search-result-thumb"><img src="' + item.image + '" alt=""></div>' +
        '<div class="search-result-info"><strong>' + highlight(item.title, query) + '</strong><span>' + item.tag + '</span></div>' +
        '<div class="search-result-price">L. ' + item.price + '</div>';

      row.addEventListener('click', () => {
        window.location.href = 'producto.html?id=' + item.id;
      });
      resultsBox.appendChild(row);
    });
  }

  function buildSearchIndex() {
    return Object.entries(PRODUCTOS).map(([id, p]) => {
      const catalogo = CATALOGOS[p.linea] || { label: p.linea };
      return {
        id,
        title: p.nombre,
        tag: catalogo.label + ' · ' + p.categoria,
        price: p.precio,
        image: p.img,
        searchText: normalize(p.nombre + ' ' + p.categoria + ' ' + catalogo.label)
      };
    });
  }

  function normalize(text) {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function highlight(title, query) {
    const safeTitle = escapeHtml(title);
    const safeQuery = escapeHtml(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (!safeQuery) return safeTitle;
    const re = new RegExp('(' + safeQuery + ')', 'ig');
    return safeTitle.replace(re, '<mark>$1</mark>');
  }
}

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
          <button class="add-btn cart-add-btn" data-name="${p.nombre}" data-price="${p.precio}" aria-label="Agregar ${p.nombre} al carrito">+</button>
        </div>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('.cart-add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const { name, price } = btn.dataset;
      addToCart(name, price, 1);
    });
  });

  wrap.hidden = false;
}

function initProductDetail() {
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

  const catalogo = CATALOGOS[producto.linea] || { label: producto.linea, href: 'HomePage.html', tabExtra: 'Detalles' };

  document.title = producto.nombre + " — Patty's Store";

  const breadcrumbCategoria = document.getElementById('breadcrumbCategoria');
  const breadcrumbNombre = document.getElementById('breadcrumbNombre');
  if (breadcrumbCategoria) {
    breadcrumbCategoria.textContent = catalogo.label;
    breadcrumbCategoria.href = catalogo.href;
  }
  if (breadcrumbNombre) breadcrumbNombre.textContent = producto.nombre;

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
    addToCart(producto.nombre, producto.precio, qty);
    agregadoMsg.hidden = false;
    setTimeout(() => { agregadoMsg.hidden = true; }, 2500);
  });

  document.getElementById('productoComprarBtn').addEventListener('click', () => {
    const qty = parseInt(cantidadInput.value, 10) || 1;
    addToCart(producto.nombre, producto.precio, qty);
    window.location.href = 'carrito.html';
  });

  renderRelacionados(id, producto);
}