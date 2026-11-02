// ==========================
// menú de navegación
// ==========================

const menuToggle = document.getElementById('menu-toggle');
const mainNav = document.getElementById('main-nav');

menuToggle.addEventListener('click', () => {

    const abierto = mainNav.classList.toggle('is-open');

    menuToggle.setAttribute('aria-expanded', abierto);

    menuToggle.textContent = abierto ? '✕' : '☰';

});

mainNav.querySelectorAll('a').forEach(enlace => {

    enlace.addEventListener('click', () => {

        mainNav.classList.remove('is-open');

        menuToggle.setAttribute('aria-expanded', 'false');

        menuToggle.textContent = '☰';

    });

});


// ==========================
// formulario de contacto
// ==========================

const formulario = document.getElementById('contact-form');

const mensajeFormulario = document.getElementById('form-message');

const botonEnviar = document.getElementById('submit-button');


formulario.addEventListener('submit', async (event) => {

    // evitar que el formulario recargue la página
    event.preventDefault();

    mensajeFormulario.textContent = '';
    mensajeFormulario.className = 'form-message';


    // obtener los datos
    const nombre = document.getElementById('nombre').value.trim();

    const email = document.getElementById('email').value.trim();

    const asunto = document.getElementById('asunto').value.trim();

    const mensaje = document.getElementById('mensaje').value.trim();


    // validar campos vacíos
    if (!nombre || !email || !asunto || !mensaje) {

        mostrarMensaje('Todos los campos son obligatorios.', 'error');

        return;
    }


    // validar longitud del mensaje
    if (mensaje.length < 10) {

        mostrarMensaje(
            'El mensaje debe tener al menos 10 caracteres.',
            'error'
        );

        return;
    }


    // validar formato de correo
    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoEmail.test(email)) {

        mostrarMensaje(
            'Ingresá una dirección de correo válida.',
            'error'
        );

        return;
    }


    // preparar datos para enviar al backend
    const datos = {
        nombre,
        email,
        asunto,
        mensaje
    };


    try {

        botonEnviar.disabled = true;
        botonEnviar.textContent = 'Enviando...';


        // enviar consulta a la API REST
        const respuesta = await fetch('/api/consultas', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(datos)

        });


        const resultado = await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                resultado.error || 'No se pudo enviar la consulta.'
            );

        }


        // confirmar envío
        mostrarMensaje(
            '¡Tu consulta fue enviada correctamente! Nos pondremos en contacto.',
            'success'
        );

        formulario.reset();


    } catch (error) {

        console.error('Error al enviar consulta:', error);

        mostrarMensaje(
            error.message || 'No se pudo conectar con el servidor.',
            'error'
        );

    } finally {

        botonEnviar.disabled = false;
        botonEnviar.textContent = 'Enviar consulta';

    }

});


// ==========================
// mostrar mensajes
// ==========================

function mostrarMensaje(texto, tipo) {

    mensajeFormulario.textContent = texto;

    mensajeFormulario.className = 'form-message ' + tipo;

}