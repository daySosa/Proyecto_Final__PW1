document.addEventListener('DOMContentLoaded', () => {

    const burgerBtn = document.getElementById('burgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (burgerBtn && mobileMenu) {
        burgerBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
        });
    }

    const btnOpenSearch = document.getElementById('btnOpenSearch');
    const btnCloseSearch = document.getElementById('btnCloseSearch');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');

    if (btnOpenSearch && searchOverlay && btnCloseSearch) {
        btnOpenSearch.addEventListener('click', () => {
            searchOverlay.classList.add('open');
            setTimeout(() => searchInput.focus(), 100);
        });

        btnCloseSearch.addEventListener('click', () => {
            searchOverlay.classList.remove('open');
        });

        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) {
                searchOverlay.classList.remove('open');
            }
        });
    }

    function showError(inputElement, message) {
        const formGroup = inputElement.closest('.form-group');
        if (!formGroup) return;

        formGroup.classList.add('has-error');

        let errorSpan = formGroup.querySelector('.error-message');
        if (!errorSpan) {
            errorSpan = document.createElement('span');
            errorSpan.className = 'error-message';
            formGroup.appendChild(errorSpan);
        }
        errorSpan.textContent = message;
    }

    function clearError(inputElement) {
        const formGroup = inputElement.closest('.form-group');
        if (!formGroup) return;

        formGroup.classList.remove('has-error');
        const errorSpan = formGroup.querySelector('.error-message');
        if (errorSpan) {
            errorSpan.remove();
        }
    }

    const newsletterForm = document.getElementById('newsletterForm');
    const newsletterEmail = document.getElementById('newsletterEmail');

    if (newsletterForm && newsletterEmail) {
        newsletterEmail.addEventListener('input', () => {
            clearError(newsletterEmail);
        });

        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailVal = newsletterEmail.value.trim();
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (emailVal === '') {
                showError(newsletterEmail, 'Por favor, ingresa tu correo electrónico.');
            } else if (!emailPattern.test(emailVal)) {
                showError(newsletterEmail, 'Ingresa un correo electrónico válido (ej. usuario@dominio.com).');
            } else {
                clearError(newsletterEmail);
                alert('¡Gracias por suscribirte! Te hemos enviado tu cupón del 10% de descuento.');
                newsletterForm.reset();
            }
        });
    }

    const cartBadgeCount = document.getElementById('cartBadgeCount');
    let currentCartCount = parseInt(cartBadgeCount ? cartBadgeCount.textContent : 0, 10);

    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentCartCount++;
            if (cartBadgeCount) {
                cartBadgeCount.textContent = currentCartCount;
            }

            const originalText = button.textContent;
            button.textContent = '¡Añadido!';
            button.style.backgroundColor = '#4E0714';

            setTimeout(() => {
                button.textContent = originalText;
                button.style.backgroundColor = '';
            }, 1200);
        });
    });

});