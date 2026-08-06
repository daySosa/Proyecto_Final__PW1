const isEmptyRegex = /^\s*$/;
const isValidEmailRegex = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/;
const isValidPhoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/;
const isValidCardRegex = /^(?:\d[ -]*?){13,19}$/;
const isValidExpRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
const isValidCvvRegex = /^\d{3,4}$/;

const municipiosHonduras = {
  "Francisco Morazán": ["Distrito Central (Tegucigalpa / Comayagüela)", "Talanga", "Sabanagrande", "Ojojona", "Valle de Ángeles", "Santa Lucía"],
  "Cortés": ["San Pedro Sula", "Choloma", "Puerto Cortés", "La Lima", "Villanueva", "San Manuel"],
  "Atlántida": ["La Ceiba", "Tela", "Jutiapa", "Arizona", "El Porvenir"],
  "Choluteca": ["Choluteca", "Marcovia", "El Triunfo", "Pespire", "Namasigüe"],
  "Comayagua": ["Comayagua", "Siguatepeque", "Taulabé", "La Libertad", "Villa de San Antonio"],
  "Copán": ["Santa Rosa de Copán", "Copán Ruinas", "La Entrada (Nueva Arcadia)", "Cucuyagua"],
  "El Paraíso": ["Danlí", "El Paraíso", "Yuscarán", "Teupasenti", "Jacaleapa"],
  "Olancho": ["Juticalpa", "Catacamas", "Dulce Nombre de Culmí", "Campamento", "San Esteban"],
  "Santa Bárbara": ["Santa Bárbara", "Las Vegas", "Quimistán", "Trinidad", "Ilama"],
  "Yoro": ["El Progreso", "Yoro", "Olanchito", "Morazán", "Santa Rita"],
  "Colón": ["Tocoa", "Trujillo", "Saba", "Sonaguera"],
  "Intibucá": ["La Esperanza", "Intibucá", "Jesús de Otoro", "Yamaranguila"],
  "La Paz": ["La Paz", "Marcala", "Santiago de Puringla", "Cane"],
  "Lempira": ["Gracias", "Erandique", "Lepaera", "La Campa"],
  "Ocotepeque": ["Ocotepeque", "Sinuapa", "San Marcos", "Mercedes"],
  "Valle": ["Nacaome", "San Lorenzo", "Amapala", "Goascorán"],
  "Gracias a Dios": ["Puerto Lempira", "Brus Laguna", "Ahuas"],
  "Islas de la Bahía": ["Roatán", "Utila", "Guanaja", "José Santos Guardiola"]
};

/* ===== Índice de productos por nombre (para recuperar la imagen en el resumen) ===== */
const PRODUCTOS_CHECKOUT = Object.assign(
  {},
  window.PRODUCTOS_MAQUILLAJE || {},
  window.PRODUCTOS_ROPA || {},
  window.PRODUCTOS_ACCESORIOS || {},
  window.PRODUCTOS_SKINCARE || {}
);

const PRODUCTOS_POR_NOMBRE_CHECKOUT = {};
Object.values(PRODUCTOS_CHECKOUT).forEach(function (p) {
  PRODUCTOS_POR_NOMBRE_CHECKOUT[p.nombre] = p.img;
});

document.addEventListener("DOMContentLoaded", function () {
  initHeaderShadow();
  initMobileMenu();
  initMoreMenu();
  setCurrentYear();
  initMunicipios();
  initCheckoutResumen();
  initPaymentToggle();
  initCheckoutValidation();
});

/* ---------- Sombra del header al hacer scroll ---------- */
function initHeaderShadow() {
  var header = document.getElementById("siteHeader");
  if (!header) return;

  window.addEventListener("scroll", function () {
    header.classList.toggle("scrolled", window.scrollY > 10);
  });
}

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

/* ---------- Departamento → Municipio ---------- */
function initMunicipios() {
  var fieldDepartamento = document.getElementById("departamento");
  var fieldMunicipio = document.getElementById("municipio");
  if (!fieldDepartamento || !fieldMunicipio) return;

  fieldDepartamento.addEventListener("change", function (e) {
    var depto = e.target.value;
    var listaMunicipios = municipiosHonduras[depto] || [];

    fieldMunicipio.innerHTML = '<option value="" disabled selected>Seleccionar municipio</option>';

    if (listaMunicipios.length > 0) {
      listaMunicipios.forEach(function (muni) {
        var opt = document.createElement("option");
        opt.value = muni;
        opt.textContent = muni;
        fieldMunicipio.appendChild(opt);
      });
      fieldMunicipio.disabled = false;
    } else {
      fieldMunicipio.disabled = true;
    }
  });
}

/* ---------- Resumen de compra (lee el carrito) ---------- */
function initCheckoutResumen() {
  var checkoutCartItemsContainer = document.getElementById("checkoutCartItems");
  var subtotalElement = document.getElementById("subtotal");
  var shippingElement = document.getElementById("shipping");
  var totalElement = document.getElementById("total");
  var cartBadge = document.getElementById("cartBadge");
  var shippingNoteElement = document.getElementById("shippingNote");
  var shippingRadios = document.querySelectorAll('input[name="envio"]');

  var carrito = [];
  var subtotalValue = 0;

  function renderizarResumen() {
    var cartData = localStorage.getItem("pattysCartV1");
    var rawCarrito = cartData ? JSON.parse(cartData) : [];

    carrito = rawCarrito.map(function (item) {
      return {
        name: item.name,
        price: Number(item.price),
        qty: item.qty || 1,
        img: PRODUCTOS_POR_NOMBRE_CHECKOUT[item.name] || ""
      };
    });

    if (!checkoutCartItemsContainer) return;

    checkoutCartItemsContainer.innerHTML = "";
    subtotalValue = 0;
    var totalUnidades = 0;

    if (carrito.length === 0) {
      checkoutCartItemsContainer.innerHTML = '<p style="font-size:0.85rem; opacity:0.6;">Tu carrito está vacío.</p>';
    } else {
      carrito.forEach(function (item) {
        var itemSubtotal = item.price * item.qty;
        subtotalValue += itemSubtotal;
        totalUnidades += item.qty;

        var itemRow = document.createElement("div");
        itemRow.className = "checkout-item-row";
        itemRow.innerHTML =
          '<div class="checkout-item-info">' +
          '<img src="' + item.img + '" alt="' + item.name + '" class="checkout-item-img">' +
          '<div>' +
          '<strong class="checkout-item-title">' + item.name + '</strong>' +
          '<span class="checkout-item-qty">Cant: ' + item.qty + '</span>' +
          '</div>' +
          '</div>' +
          '<span>L ' + itemSubtotal.toFixed(2) + '</span>';
        checkoutCartItemsContainer.appendChild(itemRow);
      });
    }

    if (cartBadge) {
      cartBadge.textContent = totalUnidades;
    }
    calcularTotales();
  }

  function calcularTotales() {
    var envioSeleccionado = document.querySelector('input[name="envio"]:checked');
    var shippingValue;

    if (envioSeleccionado && envioSeleccionado.value === "tienda") {
      shippingValue = 0;
      if (shippingNoteElement) shippingNoteElement.textContent = "Retiro en sucursal seleccionado (Sin costo).";
    } else {
      shippingValue = 120;
      if (shippingNoteElement) shippingNoteElement.textContent = "Costo de envío aplicado para entrega local.";
    }

    var totalFinal = subtotalValue + shippingValue;

    if (subtotalElement) subtotalElement.textContent = "L " + subtotalValue.toFixed(2);
    if (shippingElement) shippingElement.textContent = "L " + shippingValue.toFixed(2);
    if (totalElement) totalElement.textContent = "L " + totalFinal.toFixed(2);
  }

  shippingRadios.forEach(function (radio) {
    radio.addEventListener("change", calcularTotales);
  });

  renderizarResumen();

  window.checkoutRenderizarResumen = renderizarResumen;
}

/* ---------- Alternar sección de tarjeta según método de pago ---------- */
function initPaymentToggle() {
  var cardDataSection = document.getElementById("cardDataSection");
  var paymentRadios = document.querySelectorAll('input[name="pago"]');
  if (!cardDataSection) return;

  paymentRadios.forEach(function (radio) {
    radio.addEventListener("change", function (e) {
      cardDataSection.style.display = (e.target.value === "tarjeta") ? "block" : "none";
    });
  });
}

/* ---------- Validación del formulario de checkout ---------- */
function initCheckoutValidation() {
  var checkoutForm = document.getElementById("checkoutForm");
  var fieldNombre = document.getElementById("nombre");
  var fieldCorreo = document.getElementById("correo");
  var fieldTelefono = document.getElementById("telefono");
  var fieldDepartamento = document.getElementById("departamento");
  var fieldMunicipio = document.getElementById("municipio");
  var fieldDireccion = document.getElementById("direccion");
  var fieldCardName = document.getElementById("cardName");
  var fieldCardNumber = document.getElementById("cardNumber");
  var fieldExpiration = document.getElementById("expiration");
  var fieldCvv = document.getElementById("cvv");
  if (!checkoutForm) return;

  var fieldErrors = {};

  function attachFieldError(field, errorMessage, focusedState) {
    var parent = field.parentElement;
    if (fieldErrors[field.id]) return;

    parent.classList.add("error");
    var errorSpan = document.createElement("span");
    errorSpan.className = "error-message";
    errorSpan.textContent = errorMessage;
    fieldErrors[field.id] = errorSpan;
    parent.appendChild(errorSpan);

    function changeHandler() {
      parent.classList.remove("error");
      errorSpan.remove();
      field.removeEventListener("change", changeHandler);
      field.removeEventListener("input", changeHandler);
      delete fieldErrors[field.id];
    }

    field.addEventListener("change", changeHandler);
    field.addEventListener("input", changeHandler);

    if (!focusedState.focused) {
      focusedState.focused = true;
      field.focus();
    }
  }

  function validateFormulario() {
    var focusedState = { focused: false };
    var hasError = false;

    if (isEmptyRegex.test(fieldNombre.value)) {
      attachFieldError(fieldNombre, "¡El nombre no puede estar vacío!", focusedState);
      hasError = true;
    }

    if (isEmptyRegex.test(fieldCorreo.value)) {
      attachFieldError(fieldCorreo, "¡El correo no puede estar vacío!", focusedState);
      hasError = true;
    } else if (!isValidEmailRegex.test(fieldCorreo.value)) {
      attachFieldError(fieldCorreo, "¡Correo electrónico inválido!", focusedState);
      hasError = true;
    }

    if (isEmptyRegex.test(fieldTelefono.value)) {
      attachFieldError(fieldTelefono, "¡El teléfono no puede estar vacío!", focusedState);
      hasError = true;
    } else if (!isValidPhoneRegex.test(fieldTelefono.value)) {
      attachFieldError(fieldTelefono, "¡Número de teléfono inválido!", focusedState);
      hasError = true;
    }

    if (isEmptyRegex.test(fieldDepartamento.value) || fieldDepartamento.value === null) {
      attachFieldError(fieldDepartamento, "¡Seleccione un departamento!", focusedState);
      hasError = true;
    }

    if (isEmptyRegex.test(fieldMunicipio.value) || fieldMunicipio.value === null) {
      attachFieldError(fieldMunicipio, "¡Seleccione un municipio!", focusedState);
      hasError = true;
    }

    if (isEmptyRegex.test(fieldDireccion.value)) {
      attachFieldError(fieldDireccion, "¡La dirección de entrega no puede estar vacía!", focusedState);
      hasError = true;
    }

    var selectedPayment = document.querySelector('input[name="pago"]:checked');
    if (selectedPayment && selectedPayment.value === "tarjeta") {
      if (isEmptyRegex.test(fieldCardName.value)) {
        attachFieldError(fieldCardName, "¡Ingrese el nombre del titular!", focusedState);
        hasError = true;
      }

      if (isEmptyRegex.test(fieldCardNumber.value)) {
        attachFieldError(fieldCardNumber, "¡El número de tarjeta no puede estar vacío!", focusedState);
        hasError = true;
      } else if (!isValidCardRegex.test(fieldCardNumber.value.replace(/\s+/g, ''))) {
        attachFieldError(fieldCardNumber, "¡Número de tarjeta inválido!", focusedState);
        hasError = true;
      }

      if (isEmptyRegex.test(fieldExpiration.value)) {
        attachFieldError(fieldExpiration, "¡Ingrese la expiración!", focusedState);
        hasError = true;
      } else if (!isValidExpRegex.test(fieldExpiration.value)) {
        attachFieldError(fieldExpiration, "¡Formato MM/AA inválido!", focusedState);
        hasError = true;
      }

      if (isEmptyRegex.test(fieldCvv.value)) {
        attachFieldError(fieldCvv, "¡El CVV no puede estar vacío!", focusedState);
        hasError = true;
      } else if (!isValidCvvRegex.test(fieldCvv.value)) {
        attachFieldError(fieldCvv, "¡CVV inválido (3 o 4 dígitos)!", focusedState);
        hasError = true;
      }
    }

    return !hasError;
  }

  checkoutForm.addEventListener("submit", function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (validateFormulario()) {
      alert("¡Pedido realizado con éxito! Gracias por tu compra en Patty's Store.");
      localStorage.removeItem("pattysCartV1");
      window.location.href = "HomePage.html";
    }
  });
}