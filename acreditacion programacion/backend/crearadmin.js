const readline = require('readline');
const bcrypt = require('bcryptjs');
const conexion = require('./database');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const preguntar = (texto) => {
    return new Promise((resolve) => {
        rl.question(texto, resolve);
    });
};

async function crearAdministrador() {

    try {
        const usuario = (await preguntar('Nombre de usuario: ')).trim();

        const contraseña = await preguntar('Contraseña: ');

        // validar datos
        if (!usuario || !contraseña) {
            console.log('Error: ambos campos son obligatorios.');
            return;
        }

        if (contraseña.length < 10) {
            console.log('La contraseña debe tener al menos 10 caracteres.');
            return;
        }

        // generar hash de la contraseña
        const hash = await bcrypt.hash(contraseña, 10);

        // aca se inserta el usuario y la contraseña hasheada en la base de datos
        const sql = `
            INSERT INTO administradores (usuario, contraseña)
            VALUES (?, ?)
        `;

        conexion.query(sql, [usuario, hash], (error, resultado) => {

            if (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    console.log('Error: ese usuario ya existe.');
                } else {
                    console.error('Error al crear administrador:', error.message);
                }
            } else {
                console.log('\n¡Administrador creado correctamente!');
                console.log('ID:', resultado.insertId);
                console.log('Usuario:', usuario);
                console.log('Contraseña almacenada mediante hash.');
            }

            rl.close();
            conexion.end();
        });

    } catch (error) {
        console.error('Error:', error.message);
        rl.close();
        conexion.end();
    }
}

crearAdministrador();