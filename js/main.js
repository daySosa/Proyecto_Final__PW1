const CART_KEY = 'pattysCartV1';
const ITEMS_PER_PAGE = 8;

let currentFilter = 'todos';
let currentPage = 1;

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

function getFilteredCards() {
  const allCards = Array.from(document.querySelectorAll('#maquillajeGrid .product-card'));
  if (currentFilter === 'todos') return allCards;
  return allCards.filter(card => card.dataset.category === currentFilter);
}

function renderPage() {
  const allCards = Array.from(document.querySelectorAll('#maquillajeGrid .product-card'));
  const filtered = getFilteredCards();
  const emptyMsg = document.getElementById('maquillajeEmpty');

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const visibleSet = new Set(filtered.slice(start, end));

  allCards.forEach(card => {
    card.style.display = visibleSet.has(card) ? '' : 'none';
  });

  if (emptyMsg) emptyMsg.hidden = filtered.length > 0;

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const nav = document.getElementById('maquillajePagination');
  if (!nav) return;
  nav.innerHTML = '';

  if (totalPages <= 1) return;

  const prevBtn = document.createElement('button');
  prevBtn.className = 'page-btn nav-arrow';
  prevBtn.textContent = '‹';
  prevBtn.disabled = currentPage === 1;
  prevBtn.setAttribute('aria-label', 'Página anterior');
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderPage();
      scrollToGrid();
    }
  });
  nav.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (i === currentPage ? ' active' : '');
    btn.textContent = i;
    btn.setAttribute('aria-label', 'Ir a la página ' + i);
    if (i === currentPage) btn.setAttribute('aria-current', 'page');
    btn.addEventListener('click', () => {
      currentPage = i;
      renderPage();
      scrollToGrid();
    });
    nav.appendChild(btn);
  }

  const nextBtn = document.createElement('button');
  nextBtn.className = 'page-btn nav-arrow';
  nextBtn.textContent = '›';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.setAttribute('aria-label', 'Página siguiente');
  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderPage();
      scrollToGrid();
    }
  });
  nav.appendChild(nextBtn);
}

function scrollToGrid() {
  const grid = document.getElementById('maquillajeGrid');
  if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderPage();

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

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

const maquillajeFilters = document.getElementById('maquillajeFilters');
if (maquillajeFilters) {
  const filters = maquillajeFilters.querySelectorAll('.filter-chip');

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      currentFilter = btn.dataset.filter;
      currentPage = 1;
      renderPage();
    });
  });
}


document.addEventListener("DOMContentLoaded", function () {
  initMaquillajePagination();
});

function initMaquillajePagination() {
  var grid = document.getElementById("maquillajeGrid");
  var filtersWrap = document.getElementById("maquillajeFilters");
  var paginationNav = document.getElementById("maquillajePagination");
  var emptyMsg = document.getElementById("maquillajeEmpty");
  if (!grid || !paginationNav) return;

  var ITEMS_PER_PAGE = 8;
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