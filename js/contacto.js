document.addEventListener('DOMContentLoaded', () => {
    const burgerBtn = document.getElementById('burgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (burgerBtn && mobileMenu) {
        burgerBtn.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.toggle('open');
            burgerBtn.setAttribute('aria-expanded', isOpen);
        });
    }

    const contactForm = document.getElementById('contactForm');
    const formFeedback = document.getElementById('formFeedback');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            clearErrors();

            const nombre = document.getElementById('nombre').value.trim();
            const correo = document.getElementById('correo').value.trim();
            const asunto = document.getElementById('asunto').value;
            const mensaje = document.getElementById('mensaje').value.trim();

            let isValid = true;

            if (!nombre) {
                showError('group-nombre', 'Por favor, ingresa tu nombre completo.');
                isValid = false;
            }

            if (!correo) {
                showError('group-correo', 'Por favor, ingresa tu correo electrónico.');
                isValid = false;
            } else if (!validateEmail(correo)) {
                showError('group-correo', 'Ingresa un correo electrónico válido.');
                isValid = false;
            }

            if (!asunto) {
                showError('group-asunto', 'Selecciona un asunto para tu mensaje.');
                isValid = false;
            }

            if (!mensaje) {
                showError('group-mensaje', 'Escribe tu mensaje o consulta.');
                isValid = false;
            } else if (mensaje.length < 10) {
                showError('group-mensaje', 'El mensaje debe tener al menos 10 caracteres.');
                isValid = false;
            }

            if (isValid) {
                contactForm.reset();
                formFeedback.className = 'form-feedback success';
                formFeedback.textContent = '¡Gracias! Tu mensaje ha sido enviado exitosamente. Nos pondremos en contacto contigo pronto.';
                formFeedback.hidden = false;

                setTimeout(() => {
                    formFeedback.hidden = true;
                }, 6000);
            }
        });
    }

    function showError(groupId, message) {
        const group = document.getElementById(groupId);
        if (group) {
            group.classList.add('has-error');
            const errorSpan = document.createElement('span');
            errorSpan.className = 'error-message';
            errorSpan.textContent = message;
            group.appendChild(errorSpan);
        }
    }

    function clearErrors() {
        document.querySelectorAll('.form-group.has-error').forEach(group => {
            group.classList.remove('has-error');
        });
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        if (formFeedback) formFeedback.hidden = true;
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});