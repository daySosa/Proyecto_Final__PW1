document.addEventListener("DOMContentLoaded", function () {
  initMobileMenu();
  initMoreMenu();
  setCurrentYear();
  initNewsletterForm();
  initHeroCarousel();
  initHeaderShadow();
  initSearch();
});

/* ---------- Menú móvil ---------- */
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

/* ---------- Menú "Más" del escritorio ---------- */
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

/* ---------- Año dinámico ---------- */
function setCurrentYear() {
  var yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();
}

/* ---------- Sombra del header al hacer scroll ---------- */
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

/* ---------- Carrusel del hero (3 imágenes con transición) ---------- */
function initHeroCarousel() {
  var slides = document.querySelectorAll("#heroSlider .hero-slide");
  var dots = document.querySelectorAll("#heroDots .dot");
  if (!slides.length || !dots.length) return;

  var current = 0;
  var intervalTime = 5000;
  var timer = null;

  function goToSlide(index) {
    slides[current].classList.remove("active");
    dots[current].classList.remove("active");
    dots[current].setAttribute("aria-selected", "false");

    current = index;

    slides[current].classList.add("active");
    dots[current].classList.add("active");
    dots[current].setAttribute("aria-selected", "true");
  }

  function nextSlide() {
    var next = (current + 1) % slides.length;
    goToSlide(next);
  }

  function startAutoplay() {
    timer = setInterval(nextSlide, intervalTime);
  }

  function stopAutoplay() {
    clearInterval(timer);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      if (index === current) return;
      goToSlide(index);
      stopAutoplay();
      startAutoplay();
    });
  });

  startAutoplay();
}

/* ---------- Validación del newsletter ---------- */
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

/* =========================================================
   BÚSQUEDA FUNCIONAL
   El buscador arma su índice leyendo el propio HTML (tarjetas de
   producto, categorías y noticias), así que si agregas o cambias
   productos en el index.html, el buscador se actualiza solo:
   no hay que tocar el JS para eso.
   ========================================================= */
function initSearch() {
  var trigger = document.getElementById("searchTrigger");
  var overlay = document.getElementById("searchOverlay");
  var closeBtn = document.getElementById("searchClose");
  var input = document.getElementById("searchInput");
  var resultsBox = document.getElementById("searchResults");
  if (!trigger || !overlay || !input || !resultsBox) return;

  var index = buildSearchIndex();

  function openSearch() {
    overlay.classList.add("open");
    trigger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    setTimeout(function () { input.focus(); }, 50);
  }

  function closeSearch() {
    overlay.classList.remove("open");
    trigger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  trigger.addEventListener("click", function () {
    var isOpen = overlay.classList.contains("open");
    if (isOpen) {
      closeSearch();
    } else {
      openSearch();
    }
  });

  closeBtn.addEventListener("click", closeSearch);

  // Cierra el buscador al hacer clic fuera del cuadro
  overlay.addEventListener("click", function (event) {
    if (event.target === overlay) closeSearch();
  });

  // Cierra con la tecla Escape
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && overlay.classList.contains("open")) {
      closeSearch();
    }
  });

  input.addEventListener("input", function () {
    renderResults(input.value.trim());
  });

  function renderResults(query) {
    if (query === "") {
      resultsBox.innerHTML = '<p class="search-hint">Escribe para buscar en maquillaje, ropa, accesorios, cuidado personal y novedades.</p>';
      return;
    }

    var q = normalize(query);
    var matches = index.filter(function (item) {
      return item.searchText.indexOf(q) !== -1;
    });

    if (matches.length === 0) {
      resultsBox.innerHTML = '<p class="search-empty">No encontramos resultados para "' + escapeHtml(query) + '". Prueba con otra palabra.</p>';
      return;
    }

    resultsBox.innerHTML = "";
    matches.forEach(function (item) {
      var row = document.createElement("div");
      row.className = "search-result-item";
      row.innerHTML =
        (item.image ? '<div class="search-result-thumb"><img src="' + item.image + '" alt=""></div>' : "") +
        '<div class="search-result-info"><strong>' + highlight(item.title, query) + '</strong><span>' + item.tag + '</span></div>' +
        (item.price ? '<div class="search-result-price">' + item.price + '</div>' : "");

      row.addEventListener("click", function () {
        goToResult(item);
      });
      resultsBox.appendChild(row);
    });
  }

  function goToResult(item) {
    closeSearch();
    var target = document.getElementById(item.targetId) || item.el;
    if (!target) return;

    setTimeout(function () {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      var highlightEl = item.el || target;
      highlightEl.classList.add("search-highlight");
      setTimeout(function () {
        highlightEl.classList.remove("search-highlight");
      }, 1500);
    }, 200);
  }

  // Construye la lista de cosas buscables a partir del DOM actual
  function buildSearchIndex() {
    var items = [];

    document.querySelectorAll(".product-card").forEach(function (card, i) {
      var name = card.querySelector("h4") ? card.querySelector("h4").textContent.trim() : "Producto";
      var tag = card.querySelector(".product-tag") ? card.querySelector(".product-tag").textContent.trim() : "Producto";
      var price = card.querySelector(".product-price strong") ? card.querySelector(".product-price strong").textContent.trim() : "";
      var img = card.querySelector("img") ? card.querySelector("img").getAttribute("src") : "";

      if (!card.id) card.id = "search-product-" + i;

      items.push({
        title: name,
        tag: tag,
        price: price,
        image: img,
        el: card,
        targetId: card.id,
        searchText: normalize(name + " " + tag)
      });
    });

    document.querySelectorAll(".cat-card").forEach(function (card, i) {
      var name = card.querySelector("h3") ? card.querySelector("h3").textContent.trim() : "Categoría";
      var desc = card.querySelector("p") ? card.querySelector("p").textContent.trim() : "";
      var img = card.querySelector("img") ? card.querySelector("img").getAttribute("src") : "";

      if (!card.id) card.id = "search-category-" + i;

      items.push({
        title: name,
        tag: "Categoría · " + desc,
        price: "",
        image: img,
        el: card,
        targetId: card.id,
        searchText: normalize(name + " " + desc)
      });
    });

    document.querySelectorAll(".news-card").forEach(function (card, i) {
      var title = card.querySelector("h3") ? card.querySelector("h3").textContent.trim() : "Noticia";
      var desc = card.querySelector("p") ? card.querySelector("p").textContent.trim() : "";

      if (!card.id) card.id = "search-news-" + i;

      items.push({
        title: title,
        tag: "Noticias y eventos",
        price: "",
        image: "",
        el: card,
        targetId: card.id,
        searchText: normalize(title + " " + desc)
      });
    });

    return items;
  }

  // Quita acentos y pasa a minúsculas para que "bolso" encuentre "Bolsos"
  function normalize(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Resalta la parte del título que coincide con la búsqueda
  function highlight(title, query) {
    var safeTitle = escapeHtml(title);
    var safeQuery = escapeHtml(query).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!safeQuery) return safeTitle;
    var re = new RegExp("(" + safeQuery + ")", "ig");
    return safeTitle.replace(re, "<mark>$1</mark>");
  }
}