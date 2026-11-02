const mysql = require('mysql2');

const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'acreditacionprogramacion'
});

conexion.connect((error) => {
    if (error) {
        console.error('Error al conectar con MySQL:', error.message);
        return;
    }

    console.log('¡Conexión a MySQL exitosa!');
});

module.exports = conexion;