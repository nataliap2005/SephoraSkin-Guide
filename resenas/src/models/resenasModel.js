const mysql = require('mysql2/promise');

const connection = mysql.createPool({
    host: 'mysql_db',
    user: 'root',
    password: 'root',
    database: 'sephoraresenas',
    port : 3306
});

// Crear una reseña
async function crearResena(resena) {
    const { nombreCliente, emailCliente, nombreProductos, comentarios, rating } = resena;
    const sql = `
        INSERT INTO resenas (nombreCliente, emailCliente, nombreProductos, comentarios, rating)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE comentarios = VALUES(comentarios), rating = VALUES(rating)
    `;
    const [result] = await connection.query(sql, [nombreCliente, emailCliente, nombreProductos, comentarios, rating]);
    return result;
}

// Obtener todas las reseñas de un usuario
async function obtenerResenasDeUsuario(emailCliente) {
    if (!emailCliente) {
        throw new Error("Parámetro inválido en obtenerResenasDeUsuario");
    }
    try {
        console.log("📌 Obteniendo reseñas de usuario:", emailCliente);
        const [result] = await connection.execute(
            'SELECT nombreProductos, comentarios, rating FROM resenas WHERE emailCliente = ?',
            [emailCliente]
        );
        return result.length > 0 ? result : [];
    } catch (error) {
        console.error("❌ Error obteniendo reseñas:", error);
        throw error;
    }
}

// Eliminar reseña propia (Usuario)
async function eliminarResenaPropia(emailCliente) {
    const [result] = await connection.query(
        'DELETE FROM resenas WHERE emailCliente = ?',
        [emailCliente]
    );
    return result;
}

// Obtener todas las reseñas de un producto usando la primera palabra del nombre para una búsqueda más general
async function obtenerResenasDeProducto(nombreProductos) {
    try {
        // Extraer la primera palabra del nombre del producto
        const firstWord = nombreProductos.split(' ')[0];
        // Realizar la consulta usando LIKE: busca reseñas cuyo nombreProducto comience con la primera palabra (insensible a mayúsculas)
        const [result] = await connection.query(
            'SELECT * FROM resenas WHERE LOWER(nombreProductos) LIKE CONCAT(LOWER(?), "%")',
            [firstWord]
        );
        return result;
    } catch (error) {
        console.error("❌ Error obteniendo reseñas de producto:", error);
        throw error;
    }
}
async function eliminarResenaPorUsuarioYProducto(emailCliente, nombreProductos) {
    const query = 'DELETE FROM resenas WHERE emailCliente = ? AND nombreProductos = ?';
    const [result] = await connection.execute(query, [emailCliente, nombreProductos]);
    return result;
}

module.exports = {
    crearResena,
    obtenerResenasDeUsuario,
    eliminarResenaPropia,
    obtenerResenasDeProducto,
    eliminarResenaPorUsuarioYProducto
};
