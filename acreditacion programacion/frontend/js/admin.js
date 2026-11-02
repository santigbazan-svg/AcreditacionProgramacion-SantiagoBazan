// ==========================
// elementos del panel
// ==========================

const listaConsultas = document.getElementById('consultations-list');

const detalleConsulta = document.getElementById('detail-content');

const totalCount = document.getElementById('total-count');

const unreadCount = document.getElementById('unread-count');

const resultsCount = document.getElementById('results-count');

const mensajeAdmin = document.getElementById('admin-message');

const searchInput = document.getElementById('search-input');

const statusFilter = document.getElementById('status-filter');

const dateFrom = document.getElementById('date-from');

const dateTo = document.getElementById('date-to');

const logoutButton = document.getElementById('logout-button');

const clearFilters = document.getElementById('clear-filters');


// almacenamiento temporal de consultas
let consultas = [];


// ==========================
// cargar consultas
// ==========================

async function cargarConsultas() {

    try {

        const respuesta = await fetch('/api/consultas', {
            credentials: 'same-origin'
        });

        if (respuesta.status === 401) {
            window.location.href = '/admin/login';
            return;
        }

        if (!respuesta.ok) {
            throw new Error('No se pudieron cargar las consultas.');
        }

        consultas = await respuesta.json();

        actualizarEstadisticas();

        mostrarConsultas();

    } catch (error) {

        console.error(error);

        listaConsultas.textContent =
            'No se pudieron cargar las consultas.';

    }

}


// ==========================
// actualizar estadísticas
// ==========================

function actualizarEstadisticas() {

    const noLeidas = consultas.filter(
        consulta => Number(consulta.leida) === 0
    ).length;

    totalCount.textContent = consultas.length;

    unreadCount.textContent = noLeidas;

}


// ==========================
// filtrar consultas
// ==========================

function obtenerConsultasFiltradas() {

    const busqueda = searchInput.value.trim().toLowerCase();

    const estado = statusFilter.value;

    const desde = dateFrom.value;

    const hasta = dateTo.value;

    return consultas.filter(consulta => {

        const nombre = String(consulta.nombre || '').toLowerCase();

        const email = String(consulta.email || '').toLowerCase();

        const leida = Number(consulta.leida) === 1;

        // buscar por nombre o correo
        const coincideBusqueda =
            nombre.includes(busqueda) ||
            email.includes(busqueda);

        // filtrar por estado
        const coincideEstado =
            estado === 'todas' ||
            (estado === 'leidas' && leida) ||
            (estado === 'no-leidas' && !leida);

        // Filtrar por fecha
        const fecha = obtenerFechaLocal(consulta.fecha);

        const coincideDesde = !desde || fecha >= desde;

        const coincideHasta = !hasta || fecha <= hasta;

        return (
            coincideBusqueda &&
            coincideEstado &&
            coincideDesde &&
            coincideHasta
        );

    });

}


// ==========================
// mostrar consultas
// ==========================

function mostrarConsultas() {

    listaConsultas.replaceChildren();

    const filtradas = obtenerConsultasFiltradas();

    resultsCount.textContent =
        filtradas.length + ' consultas';

    if (filtradas.length === 0) {

        listaConsultas.textContent =
            'No se encontraron consultas.';

        listaConsultas.className = 'empty-message';

        return;
    }

    listaConsultas.className = '';

    const fragmento = document.createDocumentFragment();

    filtradas.forEach(consulta => {

        const leida = Number(consulta.leida) === 1;

        const tarjeta = document.createElement('article');

        tarjeta.className = 'consultation-card';


        // cabecera
        const parteSuperior = document.createElement('div');

        parteSuperior.className = 'consultation-card-top';

        const nombre = document.createElement('h3');

        nombre.textContent = consulta.nombre;


        const estado = document.createElement('span');

        estado.className = leida
            ? 'status-badge status-read'
            : 'status-badge status-unread';

        estado.textContent = leida ? 'Leída' : 'No leída';


        parteSuperior.append(nombre, estado);


        // correo
        const email = document.createElement('p');

        email.className = 'consultation-email';

        email.textContent = consulta.email;


        // asunto
        const asunto = document.createElement('p');

        asunto.className = 'consultation-subject';

        asunto.textContent = consulta.asunto;


        // fecha
        const fecha = document.createElement('p');

        fecha.className = 'consultation-date';

        fecha.textContent = formatearFecha(consulta.fecha);


        // botón de detalle
        const acciones = document.createElement('div');

        acciones.className = 'consultation-actions';

        const botonDetalle = document.createElement('button');

        botonDetalle.type = 'button';

        botonDetalle.textContent = 'Ver detalle →';

        botonDetalle.addEventListener('click', () => {

            mostrarDetalle(consulta.id);

        });


        acciones.appendChild(botonDetalle);

        tarjeta.append(
            parteSuperior,
            email,
            asunto,
            fecha,
            acciones
        );

        fragmento.appendChild(tarjeta);

    });

    listaConsultas.appendChild(fragmento);

}


// ==========================
// mostrar detalle
// ==========================

async function mostrarDetalle(id) {

    try {

        const respuesta = await fetch(`/api/consultas/${id}`, {
            credentials: 'same-origin'
        });

        if (respuesta.status === 401) {
            window.location.href = '/admin/login';
            return;
        }

        if (!respuesta.ok) {
            throw new Error('No se pudo obtener el detalle.');
        }

        const consulta = await respuesta.json();

        detalleConsulta.replaceChildren();

        const contenedor = document.createElement('div');

        contenedor.className = 'detail-content';


        agregarCampo(contenedor, 'Nombre', consulta.nombre);

        agregarCampo(contenedor, 'Correo electrónico', consulta.email);

        agregarCampo(contenedor, 'Asunto', consulta.asunto);

        agregarCampo(
            contenedor,
            'Fecha de recepción',
            formatearFecha(consulta.fecha)
        );

        agregarCampo(contenedor, 'Mensaje', consulta.mensaje, true);


        // estado actual
        const leida = Number(consulta.leida) === 1;

        agregarCampo(
            contenedor,
            'Estado',
            leida ? 'Leída' : 'No leída'
        );


        // botón para cambiar estado
        const botonEstado = document.createElement('button');

        botonEstado.type = 'button';

        botonEstado.className = 'btn mark-read-button';

        botonEstado.textContent = leida
            ? 'Marcar como no leída'
            : 'Marcar como leída';

        botonEstado.addEventListener('click', () => {

            cambiarEstado(consulta.id, !leida);

        });


        contenedor.appendChild(botonEstado);

        detalleConsulta.appendChild(contenedor);

    } catch (error) {

        console.error(error);

        detalleConsulta.textContent =
            'No se pudo cargar el detalle de la consulta.';

    }

}


// crear campos del detalle sin insertar HTML externo
function agregarCampo(contenedor, etiqueta, valor, esMensaje = false) {

    const campo = document.createElement('div');

    campo.className = 'detail-field';

    const titulo = document.createElement('label');

    titulo.textContent = etiqueta;

    const contenido = document.createElement('p');

    contenido.textContent = valor ?? '';

    if (esMensaje) {
        contenido.className = 'detail-message';
    }

    campo.append(titulo, contenido);

    contenedor.appendChild(campo);

}


// ==========================
// cambiar estado
// ==========================

async function cambiarEstado(id, nuevoEstado) {

    try {

        const respuesta = await fetch(`/api/consultas/${id}/estado`, {

            method: 'PATCH',

            headers: {
                'Content-Type': 'application/json'
            },

            credentials: 'same-origin',

            body: JSON.stringify({
                leida: nuevoEstado
            })

        });

        if (respuesta.status === 401) {
            window.location.href = '/admin/login';
            return;
        }

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                resultado.error || 'No se pudo actualizar el estado.'
            );
        }

        mostrarAviso('Estado actualizado correctamente.', 'success');

        await cargarConsultas();

        await mostrarDetalle(id);

    } catch (error) {

        console.error(error);

        mostrarAviso(error.message, 'error');

    }

}


// ==========================
// fechas
// ==========================

function obtenerFechaLocal(valor) {

    const fecha = new Date(valor);

    if (Number.isNaN(fecha.getTime())) {
        return '';
    }

    const anio = fecha.getFullYear();

    const mes = String(fecha.getMonth() + 1).padStart(2, '0');

    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;

}


function formatearFecha(valor) {

    const fecha = new Date(valor);

    if (Number.isNaN(fecha.getTime())) {
        return 'Fecha no disponible';
    }

    return new Intl.DateTimeFormat('es-AR', {
        dateStyle: 'short',
        timeStyle: 'short'
    }).format(fecha);

}


// ==========================
// filtros y búsqueda
// ==========================

searchInput.addEventListener('input', mostrarConsultas);

statusFilter.addEventListener('change', mostrarConsultas);

dateFrom.addEventListener('change', mostrarConsultas);

dateTo.addEventListener('change', mostrarConsultas);


clearFilters.addEventListener('click', () => {

    searchInput.value = '';

    statusFilter.value = 'todas';

    dateFrom.value = '';

    dateTo.value = '';

    mostrarConsultas();

});


// ==========================
// cerrar sesión
// ==========================

logoutButton.addEventListener('click', async () => {

    try {

        logoutButton.disabled = true;

        logoutButton.textContent = 'Cerrando sesión...';

        const respuesta = await fetch('/api/admin/logout', {

            method: 'POST',

            credentials: 'same-origin'

        });

        if (!respuesta.ok) {
            throw new Error('No se pudo cerrar la sesión.');
        }

        window.location.href = '/admin/login';

    } catch (error) {

        mostrarAviso(error.message, 'error');

        logoutButton.disabled = false;

        logoutButton.textContent = 'Cerrar sesión';

    }

});


// ==========================
// mensajes
// ==========================

function mostrarAviso(texto, tipo) {

    mensajeAdmin.textContent = texto;

    mensajeAdmin.className = 'form-message ' + tipo;

}


// ==========================
// iniciar panel
// ==========================

cargarConsultas();