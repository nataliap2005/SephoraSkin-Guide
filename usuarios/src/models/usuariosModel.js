const mysql = require('mysql2/promise');

const connection = mysql.createPool({
    host: 'mysql_db',
    user: 'root',
    password: 'root',
    database: 'sephorausuarios',
    port : 3306
});

async function traerUsuarios() {
    const result = await connection.query('SELECT * FROM usuarios');
    return result[0];
}

async function traerUsuario(email) {
    const result = await connection.query('SELECT * FROM usuarios WHERE email = ?', email);
    return result[0];
}

async function validarUsuario(usuario, contrasena) {
    const result = await connection.query('SELECT * FROM usuarios WHERE usuario = ? AND contrasena = ?', [usuario, contrasena]);
    return result[0];
}

async function crearUsuario(nombre, email, contrasena) {
    const sql = "INSERT INTO usuarios (nombre, email, contrasena) VALUES (?, ?, ?)";
    const valores = [nombre, email, contrasena];
    const result = await connection.query(sql, valores);
    return result;
}

async function eliminarUsuarioPorEmail(email) {
    try {
        const [result] = await connection.query('DELETE FROM usuarios WHERE email = ?', [email]);
        return result.affectedRows > 0;
    } catch (error) {
        throw new Error("Error al eliminar usuario: " + error.message);
    }
}

// async function actualizarRol(id, rol) {
    
//     const [result] = await connection.query(
//         'UPDATE usuarios SET rol = ? WHERE id = ?', 
//         [rol, id]
//     );

//     return result;
// }
async function actualizarRol(id, rol) {
    if (!rol) {  // Verifica si el rol es undefined o vacío
        console.log("❌ Error: Se intentó actualizar con un rol vacío.");
        return { affectedRows: 0 };
    }

    console.log(`🛠 Ejecutando consulta UPDATE para cambiar el rol a '${rol}' en el usuario con ID: ${id}`);
    
    const [result] = await connection.query(
        'UPDATE usuarios SET rol = ? WHERE id = ?', 
        [rol, id]
    );

    console.log("📌 Resultado de la consulta UPDATE:", result);
    return result;
}

async function iniciarSesion(email, contrasena) {
    const [result] = await connection.query(
        'SELECT * FROM usuarios WHERE email = ? AND contrasena = ?',
        [email, contrasena]
    );

    return result.length > 0 ? result[0] : null; 
}


module.exports = {
    traerUsuarios, traerUsuario, validarUsuario, crearUsuario, eliminarUsuarioPorEmail, 
    actualizarRol, iniciarSesion
};
