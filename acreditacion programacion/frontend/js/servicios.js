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
// cargar servicios desde mysql
// ==========================

async function cargarServicios() {

    const contenedor = document.getElementById('services-grid');

    try {

        const respuesta = await fetch('/api/servicios');

        if (!respuesta.ok) {
            throw new Error('No se pudieron obtener los servicios.');
        }

        const servicios = await respuesta.json();

        contenedor.replaceChildren();

        if (!Array.isArray(servicios) || servicios.length === 0) {

            mostrarMensaje('Actualmente no hay servicios disponibles.');

            return;
        }

        servicios.forEach(servicio => {

            const tarjeta = document.createElement('article');

            tarjeta.className = 'service-card';


            // seleccionar icono según el servicio
            const nombre = String(servicio.nombre || '').toLowerCase();

            let icono = '💻';

            if (nombre.includes('red')) {
                icono = '🌐';
            } else if (nombre.includes('mantenimiento')) {
                icono = '⚙️';
            } else if (nombre.includes('cableado')) {
                icono = '🔌';
            }


            const iconoElemento = document.createElement('div');

            iconoElemento.className = 'service-icon';

            iconoElemento.textContent = icono;

            iconoElemento.setAttribute('aria-hidden', 'true');


            // nombre del servicio
            const titulo = document.createElement('h3');

            titulo.textContent = servicio.nombre;


            // descripción
            const descripcion = document.createElement('p');

            descripcion.textContent = servicio.descripcion;


            // precio
            const precio = document.createElement('span');

            precio.className = 'service-price';

            if (
                servicio.precio === null ||
                servicio.precio === undefined ||
                servicio.precio === ''
            ) {

                precio.textContent = 'Precio: Consultar';

            } else {

                const valor = Number(servicio.precio);

                precio.textContent = Number.isFinite(valor)
                    ? 'Precio: ' + new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: 'ARS'
                    }).format(valor)
                    : 'Precio: Consultar';

            }


            // enlace de contacto
            const enlace = document.createElement('a');

            enlace.href = 'contacto.html';

            enlace.className = 'service-link';

            enlace.textContent = 'Consultar por este servicio →';


            tarjeta.append(
                iconoElemento,
                titulo,
                descripcion,
                precio,
                enlace
            );

            contenedor.appendChild(tarjeta);

        });

    } catch (error) {

        console.error('Error al cargar servicios:', error);

        mostrarMensaje(
            'No fue posible cargar los servicios. Verificá que el servidor esté funcionando.'
        );

    }

}


// ==========================
// mostrar mensaje
// ==========================

function mostrarMensaje(texto) {

    const contenedor = document.getElementById('services-grid');

    contenedor.replaceChildren();

    const mensaje = document.createElement('p');

    mensaje.className = 'loading-message';

    mensaje.textContent = texto;

    contenedor.appendChild(mensaje);

}


// iniciar
cargarServicios();