const isEmptyRegex = /^\s*$/;
const isValidEmailRegex = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/;
const isValidPhoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/;
const isValidCardRegex = /^(?:\d[ -]*?){13,19}$/;
const isValidExpRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
const isValidCvvRegex = /^\d{3,4}$/;

const municipiosHonduras = {
    "Francisco Morazán": ["Distrito Central (Tegucigalpa / Comayagüela)", 
    "Talanga", "Sabanagrande", "Ojojona", "Valle de Ángeles", "Santa Lucía"],
    "Cortés": ["San Pedro Sula", "Choloma", "Puerto Cortés", "La Lima", "Villanueva", "San Manuel"],
    "Atlántida": ["La Ceiba", "Tela", "Jutiapa", "Arizona", "El Porvenir"],
    "Choluteca": ["Choluteca", "Marcovia", "El Triunfo", "Pespire", "Namasigüe"],
    "Comayagua": ["Comayagua", "Siguatepeque", "Taulabé", "La Libertad", "Villa de San Antonio"],
    "Copán": ["Santa Rosa de Copán", "Copán Ruinas", "La Entrada (Nueva Arcadia)", "Cucuyagua"],
    "El Paraíso": ["Danlı́", "El Paraíso", "Yuscarán", "Teupasenti", "Jacaleapa"],
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

document.addEventListener("DOMContentLoaded", () => {
    const fieldDepartamento = document.getElementById("departamento");
    const fieldMunicipio = document.getElementById("municipio");

    if (fieldDepartamento && fieldMunicipio) {
        fieldDepartamento.addEventListener("change", (e) => {
            const depto = e.target.value;
            const listaMunicipios = municipiosHonduras[depto] || [];

            fieldMunicipio.innerHTML = '<option value="" disabled selected>Seleccionar municipio</option>';

            if (listaMunicipios.length > 0) {
                listaMunicipios.forEach(muni => {
                    const opt = document.createElement("option");
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

    const checkoutCartItemsContainer = document.getElementById("checkoutCartItems");
    const subtotalElement = document.getElementById("subtotal");
    const shippingElement = document.getElementById("shipping");
    const totalElement = document.getElementById("total");
    const cartBadgeCount = document.getElementById("cartBadgeCount");
    const shippingNoteElement = document.getElementById("shippingNote");
    const shippingRadios = document.querySelectorAll('input[name="envio"]');

    let carrito = [];
    let subtotalValue = 0;
    let shippingValue = 120.00;

    const renderizarResumen = () => {
        const cartData = localStorage.getItem("carritoPattyStore");
        carrito = cartData ? JSON.parse(cartData) : [];

        if (!checkoutCartItemsContainer) return;

        checkoutCartItemsContainer.innerHTML = "";
        subtotalValue = 0;
        let totalUnidades = 0;

        if (carrito.length === 0) {
            checkoutCartItemsContainer.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-muted);">Tu carrito está vacío.</p>`;
        } else {
            carrito.forEach(item => {
                const itemSubtotal = item.precio * item.cantidad;
                subtotalValue += itemSubtotal;
                totalUnidades += item.cantidad;

                const itemRow = document.createElement("div");
                itemRow.classList.add("checkout-item-row");
                itemRow.innerHTML = `
                    <div class="checkout-item-info">
                        <img src="${item.imagen || 'https://via.placeholder.com/40'}" alt="${item.nombre}" class="checkout-item-img">
                        <div>
                            <strong class="checkout-item-title">${item.nombre}</strong>
                            <span class="checkout-item-qty">Cant: ${item.cantidad}</span>
                        </div>
                    </div>
                    <span>L ${itemSubtotal.toFixed(2)}</span>
                `;
                checkoutCartItemsContainer.appendChild(itemRow);
            });
        }

        if (cartBadgeCount) cartBadgeCount.textContent = totalUnidades;
        calcularTotales();
    };

    const calcularTotales = () => {
        const envioSeleccionado = document.querySelector('input[name="envio"]:checked')?.value;

        if (envioSeleccionado === "tienda") {
            shippingValue = 0.00;
            if (shippingNoteElement) shippingNoteElement.textContent = "Retiro en sucursal seleccionado (Sin costo).";
        } else {
            shippingValue = 120.00;
            if (shippingNoteElement) shippingNoteElement.textContent = "Costo de envío aplicado para entrega local.";
        }

        const totalFinal = subtotalValue + shippingValue;

        if (subtotalElement) subtotalElement.textContent = `L ${subtotalValue.toFixed(2)}`;
        if (shippingElement) shippingElement.textContent = `L ${shippingValue.toFixed(2)}`;
        if (totalElement) totalElement.textContent = `L ${totalFinal.toFixed(2)}`;
    };

    shippingRadios.forEach(radio => radio.addEventListener("change", calcularTotales));
    renderizarResumen();

    const burgerBtn = document.getElementById("burgerBtn");
    const mobileMenu = document.getElementById("mobileMenu");
    const btnOpenSearch = document.getElementById("btnOpenSearch");
    const btnCloseSearch = document.getElementById("btnCloseSearch");
    const searchOverlay = document.getElementById("searchOverlay");
    const cardDataSection = document.getElementById("cardDataSection");
    const paymentRadios = document.querySelectorAll('input[name="pago"]');

    if (burgerBtn && mobileMenu) {
        burgerBtn.addEventListener("click", () => mobileMenu.classList.toggle("active"));
    }

    if (btnOpenSearch && searchOverlay && btnCloseSearch) {
        btnOpenSearch.addEventListener("click", () => searchOverlay.classList.add("active"));
        btnCloseSearch.addEventListener("click", () => searchOverlay.classList.remove("active"));
    }

    paymentRadios.forEach(radio => {
        radio.addEventListener("change", (e) => {
            if (cardDataSection) {
                cardDataSection.style.display = (e.target.value === "tarjeta") ? "block" : "none";
            }
        });
    });

    const checkoutForm = document.getElementById("checkoutForm");
    const fieldNombre = document.getElementById("nombre");
    const fieldCorreo = document.getElementById("correo");
    const fieldTelefono = document.getElementById("telefono");
    const fieldDireccion = document.getElementById("direccion");
    const fieldCardName = document.getElementById("cardName");
    const fieldCardNumber = document.getElementById("cardNumber");
    const fieldExpiration = document.getElementById("expiration");
    const fieldCvv = document.getElementById("cvv");

    let fieldErrors = {};

    const attachFieldError = (field, errorMessage, focusedState) => {
        const parent = field.parentElement;
        if (!fieldErrors[field.id]) {
            parent.classList.add("error");
            const errorSpan = document.createElement("SPAN");
            errorSpan.classList.add("error-message");
            errorSpan.innerHTML = errorMessage;
            fieldErrors[field.id] = errorSpan;
            parent.appendChild(errorSpan);

            const changeHandler = () => {
                parent.classList.remove("error");
                errorSpan.remove();
                field.removeEventListener("change", changeHandler);
                field.removeEventListener("input", changeHandler);
                delete fieldErrors[field.id];
                validateFormulario();
            };

            field.addEventListener("change", changeHandler);
            field.addEventListener("input", changeHandler);

            if (!focusedState.focused) {
                focusedState.focused = true;
                field.focus();
            }
        }
    };

    const validateFormulario = () => {
        let focusedState = { focused: false };
        let hasError = false;

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

        const selectedPayment = document.querySelector('input[name="pago"]:checked')?.value;
        if (selectedPayment === "tarjeta") {
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
    };

    if (checkoutForm) {
        checkoutForm.addEventListener("submit", (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (validateFormulario()) {
                alert("¡Pedido realizado con éxito! Gracias por tu compra en Patty's Store.");
                localStorage.removeItem("carritoPattyStore");
                window.location.href = "index.html";
            }
        });
    }
});