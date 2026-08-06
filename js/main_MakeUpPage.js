const CART_KEY = 'pattysCartV1';
const ITEMS_PER_PAGE = 8;

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

function addToCart(name, price) {
  const cart = getCart();
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price: Number(price), qty: 1 });
  }
  saveCart(cart);
  updateCartBadge();
}

function updateCartBadge() {
  const cart = getCart();
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = totalQty;
}

function initAddToCart() {
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const name = btn.dataset.product || 'Producto';
      const price = btn.dataset.price || '0';
      addToCart(name, price);

      const originalText = btn.textContent;
      btn.textContent = '✓';
      setTimeout(() => { btn.textContent = originalText; }, 900);
    });
  });
}

function initMaquillajePagination() {
  var grid = document.getElementById("maquillajeGrid");
  var filtersWrap = document.getElementById("maquillajeFilters");
  var paginationNav = document.getElementById("maquillajePagination");
  var emptyMsg = document.getElementById("maquillajeEmpty");
  if (!grid || !paginationNav) return;

  var currentFilter = "todos";
  var currentPage = 1;

  var allCards = Array.prototype.slice.call(grid.querySelectorAll(".product-card"));

  function getFiltered() {
    if (currentFilter === "todos") return allCards;
    return allCards.filter(function (card) {
      return card.dataset.category === currentFilter;
    });
  }

  function renderPage() {
    var filtered = getFiltered();
    var totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    if (currentPage > totalPages) currentPage = totalPages;

    var start = (currentPage - 1) * ITEMS_PER_PAGE;
    var end = start + ITEMS_PER_PAGE;
    var visible = filtered.slice(start, end);
    var visibleSet = new Set(visible);

    allCards.forEach(function (card) {
      card.style.display = visibleSet.has(card) ? "" : "none";
    });

    if (emptyMsg) emptyMsg.hidden = filtered.length > 0;

    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    paginationNav.innerHTML = "";
    if (totalPages <= 1) return;

    var prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "page-btn nav-arrow";
    prevBtn.textContent = "‹";
    prevBtn.disabled = currentPage === 1;
    prevBtn.setAttribute("aria-label", "Página anterior");
    prevBtn.addEventListener("click", function () {
      if (currentPage > 1) {
        currentPage--;
        renderPage();
        scrollToGrid();
      }
    });
    paginationNav.appendChild(prevBtn);

    for (var i = 1; i <= totalPages; i++) {
      (function (pageNum) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "page-btn" + (pageNum === currentPage ? " active" : "");
        btn.textContent = pageNum;
        btn.setAttribute("aria-label", "Ir a la página " + pageNum);
        if (pageNum === currentPage) btn.setAttribute("aria-current", "page");
        btn.addEventListener("click", function () {
          currentPage = pageNum;
          renderPage();
          scrollToGrid();
        });
        paginationNav.appendChild(btn);
      })(i);
    }

    var nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "page-btn nav-arrow";
    nextBtn.textContent = "›";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.setAttribute("aria-label", "Página siguiente");
    nextBtn.addEventListener("click", function () {
      if (currentPage < totalPages) {
        currentPage++;
        renderPage();
        scrollToGrid();
      }
    });
    paginationNav.appendChild(nextBtn);
  }

  function scrollToGrid() {
    grid.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (filtersWrap) {
    var chips = filtersWrap.querySelectorAll(".filter-chip");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) {
          c.classList.remove("active");
          c.setAttribute("aria-selected", "false");
        });
        chip.classList.add("active");
        chip.setAttribute("aria-selected", "true");

        currentFilter = chip.dataset.filter;
        currentPage = 1;
        renderPage();
      });
    });
  }

  renderPage();
}

function initNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  const emailInput = document.getElementById('newsletterEmail');
  const errorSpan = document.getElementById('newsletterError');
  const successMsg = document.getElementById('newsletterSuccess');

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const value = emailInput.value.trim();

    if (value === '' || !isValidEmail(value)) {
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

function isValidEmail(value) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(value);
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  initAddToCart();
  initMaquillajePagination();
  initNewsletterForm();

  const moreBtn = document.getElementById('moreBtn');
  const navMore = document.getElementById('navMore');
  if (moreBtn && navMore) {
    moreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navMore.classList.toggle('open');
      moreBtn.setAttribute('aria-expanded', String(isOpen));
    });
    document.addEventListener('click', (e) => {
      if (!navMore.contains(e.target)) {
        navMore.classList.remove('open');
        moreBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const burgerBtn = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (burgerBtn && mobileMenu) {
    burgerBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      burgerBtn.setAttribute('aria-expanded', String(isOpen));
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        burgerBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});