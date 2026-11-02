// ==========================
// login administrativo
// ==========================

const formulario = document.getElementById('login-form');

const mensaje = document.getElementById('login-message');

const boton = document.getElementById('login-button');


formulario.addEventListener('submit', async (event) => {

    event.preventDefault();

    mensaje.textContent = '';
    mensaje.className = 'form-message';

    const usuario = document.getElementById('usuario').value.trim();

    const contrasena = document.getElementById('contrasena').value;

    if (!usuario || !contrasena) {

        mostrarMensaje('Completá todos los campos.', 'error');

        return;
    }

    try {

        boton.disabled = true;
        boton.textContent = 'Verificando...';

        const respuesta = await fetch('/api/admin/login', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            credentials: 'same-origin',

            body: JSON.stringify({
                usuario,
                contrasena
            })

        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                resultado.error || 'No se pudo iniciar sesión.'
            );

        }

        mostrarMensaje(
            '¡Inicio de sesión exitoso!',
            'success'
        );

        formulario.reset();

        window.location.href = '/admin/panel.html';

        // la sesión queda almacenada en la cookie del navegador.
        // en la siguiente etapa, redirigiremos al panel administrativo.

    } catch (error) {

        mostrarMensaje(error.message, 'error');

    } finally {

        boton.disabled = false;
        boton.textContent = 'Iniciar sesión';

    }

});


function mostrarMensaje(texto, tipo) {

    mensaje.textContent = texto;

    mensaje.className = 'form-message ' + tipo;

}