const mysql = require('mysql2/promise');

const connection = mysql.createPool({
    host: 'mysql_db',
    user: 'root',
    password: 'root',
    database: 'favoritosSephora',
    port: 3306
});

// 🔹 Agregar un producto a favoritos
const agregarFavorito = async (email, productName) => {
    const sql = `
        INSERT INTO favoritos (emailClient, product_name, fecha_agregado)
        VALUES (?, ?, NOW())
    `;

    try {
        const [result] = await connection.execute(sql, [email, productName]);
        return result;
    } catch (error) {
        console.error("❌ Error agregando favorito:", error);
        throw error;
    }
};

// 🔹 Eliminar un producto de favoritos
const eliminarFavorito = async (emailClient, productName) => {
    if (!emailClient || !productName) {
        throw new Error("Parámetros inválidos en eliminarFavorito");
    }

    try {
        console.log("🗑 Eliminando favorito:", emailClient, productName);
        const [result] = await connection.execute(
            'DELETE FROM favoritos WHERE emailClient = ? AND product_name = ?',
            [emailClient, productName]
        );
        return result;
    } catch (error) {
        console.error("❌ Error eliminando favorito:", error);
        throw error;
    }
};

// 🔹 Obtener todos los productos favoritos de un usuario
const obtenerFavoritosPorUsuario = async (emailClient) => {
    if (!emailClient) {
        throw new Error("Parámetro inválido en obtenerFavoritosPorUsuario");
    }

    try {
        console.log("📌 Obteniendo favoritos de usuario:", emailClient);
        const [result] = await connection.execute(
            'SELECT product_name FROM favoritos WHERE emailClient = ? ORDER BY fecha_agregado',
            [emailClient]
        );
        return result.map(row => row.product_name);
    } catch (error) {
        console.error("❌ Error obteniendo favoritos:", error);
        throw error;
    }
};

const obtenerFavoritosPorProducto = async (nombreProducto) => {
    try {
        console.log(`📌 Buscando favoritos para el producto: ${nombreProducto}`);

        const [result] = await connection.query(`
            SELECT product_name, COUNT(DISTINCT emailClient) AS cantidad_usuarios
            FROM favoritos
            WHERE product_name = ?
            GROUP BY product_name;
        `, [nombreProducto]);

        console.log("📊 Resultado SQL:", result); // 🔴 Agregamos log para ver qué devuelve

        return result.length > 0 ? result[0] : null;
    } catch (error) {
        console.error("❌ Error obteniendo favoritos:", error);
        throw error;
    }
};

module.exports = {
    agregarFavorito,
    eliminarFavorito,
    obtenerFavoritosPorUsuario,
    obtenerFavoritosPorProducto
};
