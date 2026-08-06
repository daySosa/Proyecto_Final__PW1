document.addEventListener("DOMContentLoaded", function () {
  initMobileMenu();
  initMoreMenu();
  setCurrentYear();
  initNewsletterForm();
  initHeroCarousel();
  initHeaderShadow();
  initAddToCart();
  updateCartBadge();
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

function initHeroCarousel() {
  var slider = document.getElementById("heroSlider");
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

  if (slider) {
    slider.addEventListener("mouseenter", stopAutoplay);
    slider.addEventListener("mouseleave", startAutoplay);
  }

  startAutoplay();
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