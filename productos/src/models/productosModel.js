const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'mysql_db',
    user: 'root',
    password: 'root',
    database: 'sephoraproductos',
    port : 3306
});

db.connect((err) => {
    if (err) {
        console.error('❌ Error al conectar a MariaDB:', err);
        return;
    }
    console.log('✅ Conectado a MariaDB');
});

// Agregar un producto
const addProduct = (newProduct, callback) => {
    const sql = `
        INSERT INTO productos (
            product_name,
            brand_id,
            brand_name,
            ingredients,
            primary_category,
            secondary_category,
            tertiary_category,
            price_usd,
            size,
            characteristics,
            highlights,
            online_only,
            limited_edition,
            new,
            sephora_exclusive,
            out_of_stock
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        newProduct.product_name,
        newProduct.brand_id,
        newProduct.brand_name,
        newProduct.ingredients,
        newProduct.primary_category,
        newProduct.secondary_category,
        newProduct.tertiary_category,
        newProduct.price_usd,
        newProduct.size,
        JSON.stringify(newProduct.characteristics),
        newProduct.highlights,
        newProduct.online_only,
        newProduct.limited_edition,
        newProduct.new,
        newProduct.sephora_exclusive,
        newProduct.out_of_stock
    ];

    db.query(sql, values, callback);
};

// Obtener todos los productos
const getAllProducts = (callback) => {
    const sql = 'SELECT * FROM productos';
    db.query(sql, callback);
};

// Obtener un producto por nombre (sin distinguir mayúsculas/minúsculas)
const getProductByName = (productName, callback) => {
    const sql = 'SELECT * FROM productos WHERE LOWER(product_name) = LOWER(?)';
    db.query(sql, [productName], callback);
};

// Actualizar un producto por nombre
const updateProduct = (productName, updatedProduct, callback) => {
    // Asegurar que 'characteristics' sea un JSON válido
    const characteristics = Array.isArray(updatedProduct.characteristics)
        ? JSON.stringify(updatedProduct.characteristics)
        : (updatedProduct.characteristics || "[]");

    const sql = `
        UPDATE productos
        SET
            brand_id = ?,
            brand_name = ?,
            ingredients = ?,
            primary_category = ?,
            secondary_category = ?,
            tertiary_category = ?,
            price_usd = ?,
            size = ?,
            characteristics = ?,
            highlights = ?,
            online_only = ?,
            limited_edition = ?,
            new = ?,
            sephora_exclusive = ?,
            out_of_stock = ?
        WHERE LOWER(product_name) = LOWER(?)
    `;
    const values = [
        updatedProduct.brand_id,
        updatedProduct.brand_name,
        updatedProduct.ingredients,
        updatedProduct.primary_category,
        updatedProduct.secondary_category,
        updatedProduct.tertiary_category,
        updatedProduct.price_usd,
        updatedProduct.size,
        characteristics,
        updatedProduct.highlights,
        updatedProduct.online_only,
        updatedProduct.limited_edition,
        updatedProduct.new,
        updatedProduct.sephora_exclusive,
        updatedProduct.out_of_stock,
        productName
    ];

    db.query(sql, values, callback);
};

// Eliminar un producto por nombre
const deleteProduct = (productName, callback) => {
    const sql = 'DELETE FROM productos WHERE LOWER(product_name) = LOWER(?)';
    db.query(sql, [productName], callback);
};

// Filtrar por orden de precio
const getProductsByPriceOrder = (order, callback) => {
    const direction = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    const sql = `SELECT * FROM productos ORDER BY price_usd ${direction}`;
    db.query(sql, callback);
};

// Filtrar por ingrediente
const getProductsByIngredient = (ingredient, callback) => {
    const sql = `SELECT * FROM productos WHERE ingredients LIKE ?`;
    db.query(sql, [`%${ingredient}%`], callback);
};

// Filtrar por categoría (primaria, secundaria o terciaria)
const getProductsByCategory = (category, callback) => {
    const sql = `
        SELECT * FROM productos
        WHERE primary_category = ? OR secondary_category = ? OR tertiary_category = ?
    `;
    db.query(sql, [category, category, category], callback);
};

// Filtrar por marca
const getProductsByBrand = (brand, callback) => {
    const sql = `SELECT * FROM productos WHERE brand_name = ?`;
    db.query(sql, [brand], callback);
};

// Filtrar productos nuevos
const getNewProducts = (callback) => {
    const sql = `SELECT * FROM productos WHERE \`new\` = 1`;
    db.query(sql, callback);
};


module.exports = {
    addProduct,
    getAllProducts,
    getProductByName,
    updateProduct,
    deleteProduct,
    getProductsByPriceOrder,
    getProductsByIngredient,
    getProductsByCategory,
    getProductsByBrand,
    getNewProducts
};
