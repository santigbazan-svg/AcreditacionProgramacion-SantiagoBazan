// ==========================
// menú de navegación
// ==========================

const menuToggle = document.getElementById('menu-toggle');
const mainNav = document.getElementById('main-nav');

menuToggle.addEventListener('click', () => {

    const abierto = mainNav.classList.toggle('is-open');

    menuToggle.setAttribute('aria-expanded', abierto);

    menuToggle.setAttribute(
        'aria-label',
        abierto ? 'Cerrar menú' : 'Abrir menú'
    );

    menuToggle.textContent = abierto ? '✕' : '☰';
});


// cerrar menú al seleccionar una sección

mainNav.querySelectorAll('a').forEach(enlace => {

    enlace.addEventListener('click', () => {

        mainNav.classList.remove('is-open');

        menuToggle.setAttribute('aria-expanded', 'false');

        menuToggle.setAttribute('aria-label', 'Abrir menú');

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
            throw new Error('No se pudieron obtener los servicios');
        }

        const servicios = await respuesta.json();

        contenedor.replaceChildren();

        if (!Array.isArray(servicios) || servicios.length === 0) {

            contenedor.textContent = 'Actualmente no hay servicios disponibles.';

            return;
        }

        const fragmento = document.createDocumentFragment();

        servicios.forEach((servicio) => {

            // crear tarjeta
            const tarjeta = document.createElement('article');

            tarjeta.classList.add('service-card');


            // asignar icono según el servicio
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

            iconoElemento.classList.add('service-icon');

            iconoElemento.textContent = icono;

            iconoElemento.setAttribute('aria-hidden', 'true');


            // nombre
            const titulo = document.createElement('h3');

            titulo.textContent = servicio.nombre;


            // descripción
            const descripcion = document.createElement('p');

            descripcion.textContent = servicio.descripcion;


            // precio
            const precio = document.createElement('span');

            precio.classList.add('service-price');

            if (
                servicio.precio === null ||
                servicio.precio === undefined
            ) {
                precio.textContent = 'Precio: Consultar';
            } else {

                const precioFormateado = new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: 'ARS'
                }).format(Number(servicio.precio));

                precio.textContent = 'Precio: ' + precioFormateado;
            }


            // construir tarjeta
            tarjeta.append(
                iconoElemento,
                titulo,
                descripcion,
                precio
            );

            fragmento.appendChild(tarjeta);

        });

        contenedor.appendChild(fragmento);

    } catch (error) {

        console.error('Error al cargar servicios:', error);

        contenedor.textContent =
            'No se pudieron cargar los servicios. Verificá que el servidor y MySQL estén funcionando.';

    }

}


// ejecutar carga de servicios
cargarServicios();