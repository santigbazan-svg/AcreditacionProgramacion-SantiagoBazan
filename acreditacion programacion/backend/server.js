const express = require('express');
const cors = require('cors');
const path = require('path');
const conexion = require('./database');
const bcrypt = require('bcryptjs');
const session = require('express-session');


const app = express();
const PORT = 3000;

// middwlare
app.use(cors());
app.use(express.json());

// configuración de la sesión
app.use(session({
    secret: 'BALANCE-clave-sesion-local-2026-cambiar',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60
    }
}));


// ruta para iniciar sesión como administrador
app.post('/api/admin/login', (req, res) => {

    const { usuario, contrasena } = req.body;

    // validar los datos recibidos
    if (
        typeof usuario !== 'string' ||
        typeof contrasena !== 'string' ||
        !usuario.trim() ||
        !contrasena
    ) {
        return res.status(400).json({
            error: 'Debes ingresar usuario y contraseña'
        });
    }

    // buscar administrador en MySQL
    const sql = `
        SELECT id, usuario, contraseña AS hash
        FROM administradores
        WHERE usuario = ?
        LIMIT 1
    `;

    conexion.query(sql, [usuario.trim()], async (error, resultados) => {

        if (error) {
            console.error('Error al buscar administrador:', error.message);

            return res.status(500).json({
                error: 'Error interno del servidor'
            });
        }

        // comprobar si existe el administrador
        if (resultados.length === 0) {
            return res.status(401).json({
                error: 'Usuario o contraseña incorrectos'
            });
        }

        const administrador = resultados[0];

        try {

            // comparar contraseña con el hash almacenado
            const contraseñaValida = await bcrypt.compare(
                contrasena,
                administrador.hash
            );

            if (!contraseñaValida) {
                return res.status(401).json({
                    error: 'Usuario o contraseña incorrectos'
                });
            }

            // crear una nueva sesión
            req.session.regenerate((errorSesion) => {

                if (errorSesion) {
                    return res.status(500).json({
                        error: 'No se pudo iniciar la sesión'
                    });
                }

                req.session.adminId = administrador.id;
                req.session.usuario = administrador.usuario;

                req.session.save((errorGuardado) => {

                    if (errorGuardado) {
                        return res.status(500).json({
                            error: 'No se pudo guardar la sesión'
                        });
                    }

                    res.status(200).json({
                        mensaje: 'Inicio de sesión exitoso',
                        administrador: {
                            id: administrador.id,
                            usuario: administrador.usuario
                        }
                    });
                });
            });

        } catch (error) {
            console.error('Error al verificar contraseña:', error.message);

            res.status(500).json({
                error: 'Error al verificar las credenciales'
            });
        }
    });
});
// ruta para cerrar sesión
app.post('/api/admin/logout', verificarAutenticacion, (req, res) => {

    req.session.destroy((error) => {

        if (error) {
            console.error('Error al cerrar sesión:', error.message);

            return res.status(500).json({
                error: 'No se pudo cerrar la sesión'
            });
        }

        res.clearCookie('connect.sid');

        res.status(200).json({
            mensaje: 'Sesión cerrada correctamente'
        });
    });
});
// panel administrativo bien protegido
app.get('/admin/panel', verificarAutenticacion, (req, res) => {

    res.sendFile(
        path.join(__dirname, '../frontend/admin/panel.html')
    );

});

// proteger también el acceso directo al archivo
app.get('/admin/panel.html', verificarAutenticacion, (req, res) => {

    res.sendFile(
        path.join(__dirname, '../frontend/admin/panel.html')
    );

});
// middleware para verificar la autenticación
function verificarAutenticacion(req, res, next) {

    if (!req.session || !req.session.adminId) {
        return res.status(401).json({
            error: 'Acceso no autorizado. Debes iniciar sesión.'
        });
    }

    // si está autenticado, continúa con la ruta
    next();
}
// vista del login administrativo
app.get('/admin/login', (req, res) => {

    res.sendFile(
        path.join(__dirname, '../frontend/admin/login.html')
    );

});
// servir los archivos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// ruta de prueba
app.get('/api/servicios', (req, res) => {
    conexion.query('SELECT * FROM servicios', (error, resultados) => {
        if (error) {
            console.error('Error al obtener servicios:', error.message);
            return res.status(500).json({
                error: 'No se pudieron obtener los servicios'
            });
        }

        res.json(resultados);
    });
});
// ruta para recibir y guardar consultas
app.post('/api/consultas', (req, res) => {

    const { nombre, email, asunto, mensaje } = req.body;

    // validar campos obligatorios
    if (!nombre || !email || !asunto || !mensaje) {
        return res.status(400).json({
            error: 'Todos los campos son obligatorios'
        });
    }

    // limpiar espacios innecesarios
    const nombreLimpio = nombre.trim();
    const emailLimpio = email.trim();
    const asuntoLimpio = asunto.trim();
    const mensajeLimpio = mensaje.trim();

    // validar longitud de los campos
    if (
        nombreLimpio.length > 100 ||
        emailLimpio.length > 150 ||
        asuntoLimpio.length > 150 ||
        mensajeLimpio.length < 10
    ) {
        return res.status(400).json({
            error: 'Los datos ingresados no cumplen los requisitos'
        });
    }

    // validar formato del correo electrónico
    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoEmail.test(emailLimpio)) {
        return res.status(400).json({
            error: 'El correo electrónico no es válido'
        });
    }

    // insertar consulta en MySQL
    const sql = `
        INSERT INTO consultas (nombre, email, asunto, mensaje)
        VALUES (?, ?, ?, ?)
    `;

    conexion.query(
        sql,
        [nombreLimpio, emailLimpio, asuntoLimpio, mensajeLimpio],
        (error, resultado) => {

            if (error) {
                console.error('Error al guardar consulta:', error.message);

                return res.status(500).json({
                    error: 'No se pudo guardar la consulta'
                });
            }

            res.status(201).json({
                mensaje: 'Consulta enviada correctamente',
                id: resultado.insertId
            });
        }
    );
});
// ruta para obtener todas las consultas
app.get('/api/consultas', verificarAutenticacion, (req, res) => {

    const sql = `
        SELECT id, nombre, email, asunto, mensaje, fecha, leida
        FROM consultas
        ORDER BY fecha DESC
    `;

    conexion.query(sql, (error, resultados) => {

        if (error) {
            console.error('Error al obtener consultas:', error.message);

            return res.status(500).json({
                error: 'No se pudieron obtener las consultas'
            });
        }

        res.status(200).json(resultados);
    });
});
// ruta para obtener una consulta específica
app.get('/api/consultas/:id', verificarAutenticacion, (req, res) => {

    const id = Number(req.params.id);

    // validar que el ID sea un número entero positivo
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'El ID proporcionado no es válido'
        });
    }

    const sql = `
        SELECT id, nombre, email, asunto, mensaje, fecha, leida
        FROM consultas
        WHERE id = ?
    `;

    conexion.query(sql, [id], (error, resultados) => {

        if (error) {
            console.error('Error al obtener consulta:', error.message);

            return res.status(500).json({
                error: 'No se pudo obtener la consulta'
            });
        }

        // comprobar si existe la consulta
        if (resultados.length === 0) {
            return res.status(404).json({
                error: 'No se encontró la consulta solicitada'
            });
        }

        res.status(200).json(resultados[0]);
    });
});
// ruta para cambiar el estado de una consulta
app.patch('/api/consultas/:id/estado', verificarAutenticacion, (req, res) => {

    const id = Number(req.params.id);
    const { leida } = req.body;

    // validar ID
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'El ID proporcionado no es válido'
        });
    }

    // validar el estado
    if (typeof leida !== 'boolean') {
        return res.status(400).json({
            error: 'El estado debe ser verdadero o falso'
        });
    }

    const sql = `
        UPDATE consultas
        SET leida = ?
        WHERE id = ?
    `;

    conexion.query(sql, [leida ? 1 : 0, id], (error) => {

        if (error) {
            console.error('Error al actualizar consulta:', error.message);

            return res.status(500).json({
                error: 'No se pudo actualizar el estado'
            });
        }

        // comprobar que la consulta exista
        conexion.query(
            'SELECT id, leida FROM consultas WHERE id = ?',
            [id],
            (error, resultados) => {

                if (error) {
                    return res.status(500).json({
                        error: 'No se pudo verificar la consulta'
                    });
                }

                if (resultados.length === 0) {
                    return res.status(404).json({
                        error: 'No se encontró la consulta'
                    });
                }

                res.status(200).json({
                    mensaje: 'Estado actualizado correctamente',
                    consulta: resultados[0]
                });
            }
        );
    });
});
// iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:3000`);
});