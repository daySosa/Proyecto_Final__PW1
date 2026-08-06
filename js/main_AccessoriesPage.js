document.addEventListener("DOMContentLoaded", function () {
  initMobileMenu();
  initMoreMenu();
  setCurrentYear();
  initNewsletterForm();
  initHeaderShadow();
  initAddToCart();
  updateCartBadge();
  initAccesoriosCatalog();
});

function initMobileMenu() {
  var burger = document.getElementById("burgerBtn");
  var mobileMenu = document.getElementById("mobileMenu");
  if (!burger || !mobileMenu) return;

  burger.addEventListener("click", function () {
    var isOpen = mobileMenu.classList.toggle("open");
    burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  mobileMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      mobileMenu.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    });
  });
}

function initMoreMenu() {
  var navMore = document.getElementById("navMore");
  var moreBtn = document.getElementById("moreBtn");
  if (!navMore || !moreBtn) return;

  moreBtn.addEventListener("click", function (event) {
    event.stopPropagation();
    var isOpen = navMore.classList.toggle("open");
    moreBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  document.addEventListener("click", function (event) {
    if (!navMore.contains(event.target)) {
      navMore.classList.remove("open");
      moreBtn.setAttribute("aria-expanded", "false");
    }
  });

  navMore.querySelectorAll(".more-menu a").forEach(function (link) {
    link.addEventListener("click", function () {
      navMore.classList.remove("open");
      moreBtn.setAttribute("aria-expanded", "false");
    });
  });
}

function setCurrentYear() {
  var yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();
}

function initHeaderShadow() {
  var header = document.getElementById("siteHeader");
  if (!header) return;

  window.addEventListener("scroll", function () {
    if (window.scrollY > 10) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
}

function initNewsletterForm() {
  var form = document.getElementById("newsletterForm");
  if (!form) return;

  var emailInput = document.getElementById("newsletterEmail");
  var errorSpan = document.getElementById("newsletterError");
  var successMsg = document.getElementById("newsletterSuccess");

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var value = emailInput.value.trim();

    if (value === "" || !isValidEmail(value)) {
      emailInput.classList.add("invalid");
      errorSpan.textContent = "Por favor ingresa un correo electrónico válido.";
      successMsg.classList.remove("show");
      return;
    }

    emailInput.classList.remove("invalid");
    errorSpan.textContent = "";
    successMsg.textContent = "¡Gracias por suscribirte, " + value + "!";
    successMsg.classList.add("show");
    form.reset();
  });
}

function isValidEmail(value) {
  var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(value);
}

function initAddToCart() {
  var buttons = document.querySelectorAll(".add-btn");
  if (!buttons.length) return;

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      var name = btn.dataset.product || "Producto";
      var price = Number(btn.dataset.price) || 0;

      var cart = getCart();
      var existing = cart.find(function (item) { return item.name === name; });
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ name: name, price: price, qty: 1 });
      }
      saveCart(cart);
      updateCartBadge();

      var originalText = btn.textContent;
      btn.textContent = "✓";
      setTimeout(function () {
        btn.textContent = originalText;
      }, 900);
    });
  });
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem("pattysCartV1")) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("pattysCartV1", JSON.stringify(cart));
}

function updateCartBadge() {
  var badge = document.getElementById("cartBadge");
  if (!badge) return;
  var cart = getCart();
  var totalQty = cart.reduce(function (sum, item) { return sum + (item.qty || 1); }, 0);
  badge.textContent = totalQty;
}

function initAccesoriosCatalog() {
  var grid = document.getElementById("accesoriosGrid");
  var filtersWrap = document.getElementById("accesoriosFilters");
  var paginationNav = document.getElementById("accesoriosPagination");
  var emptyMsg = document.getElementById("accesoriosEmpty");
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