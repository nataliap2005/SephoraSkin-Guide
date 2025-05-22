const express = require('express');
const router = express.Router();
const productosModel = require('../models/productosModel');

// Agregar un nuevo producto
router.post('/', (req, res) => {
    const nuevoProducto = req.body;

    productosModel.addProduct(nuevoProducto, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: '❌ El nombre del producto ya existe' });
            }
            console.error('❌ Error al agregar producto:', err);
            return res.status(500).json({ message: 'Error al agregar producto' });
        }
        res.status(201).json({ message: '✅ Producto agregado correctamente', productId: result.insertId });
    });
});

// Obtener todos los productos
router.get('/', (req, res) => {
    productosModel.getAllProducts((err, results) => {
        if (err) {
            console.error('❌ Error al obtener productos:', err);
            return res.status(500).json({ message: 'Error al obtener productos' });
        }
        res.json(results);
    });
});

// Obtener un producto por nombre (manejo de espacios y caracteres especiales)
router.get('/:name', (req, res) => {
    const productName = decodeURIComponent(req.params.name); // Decodificar espacios en la URL

    productosModel.getProductByName(productName, (err, results) => {
        if (err) {
            console.error('❌ Error al obtener el producto:', err);
            return res.status(500).json({ message: 'Error al obtener el producto' });
        } else if (!results || results.length === 0) {
            return res.status(404).json({ message: '❌ Producto no encontrado' });
        }
        res.json(results[0]);
    });
});

// Actualizar un producto por nombre
router.put('/:name', (req, res) => {
    const productName = decodeURIComponent(req.params.name);
    const updatedProduct = req.body;

    productosModel.updateProduct(productName, updatedProduct, (err, result) => {
        if (err) {
            console.error('❌ Error al actualizar el producto:', err);
            return res.status(500).json({ message: 'Error al actualizar el producto' });
        } else if (result.affectedRows === 0) {
            return res.status(404).json({ message: '❌ Producto no encontrado' });
        }
        res.json({ message: '✅ Producto actualizado correctamente' });
    });
});

// Eliminar un producto por nombre
router.delete('/:name', (req, res) => {
    const productName = decodeURIComponent(req.params.name);

    productosModel.deleteProduct(productName, (err, result) => {
        if (err) {
            console.error('❌ Error al eliminar el producto:', err);
            return res.status(500).json({ message: 'Error al eliminar el producto' });
        } else if (result.affectedRows === 0) {
            return res.status(404).json({ message: '❌ Producto no encontrado' });
        }
        res.json({ message: '✅ Producto eliminado correctamente' });
    });
});

// Ordenar por precio
router.get('/filtro/precio/:orden', (req, res) => {
    const orden = req.params.orden; // 'asc' o 'desc'

    productosModel.getProductsByPriceOrder(orden, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error al filtrar por precio' });
        res.json(results);
    });
});

// Filtrar por ingrediente
router.get('/filtro/ingrediente/:ingrediente', (req, res) => {
    const ingrediente = decodeURIComponent(req.params.ingrediente);

    productosModel.getProductsByIngredient(ingrediente, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error al filtrar por ingrediente' });
        res.json(results);
    });
});

// Filtrar por categoría
router.get('/filtro/categoria/:categoria', (req, res) => {
    const categoria = decodeURIComponent(req.params.categoria);

    productosModel.getProductsByCategory(categoria, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error al filtrar por categoría' });
        res.json(results);
    });
});

// Filtrar por marca
router.get('/filtro/marca/:marca', (req, res) => {
    const marca = decodeURIComponent(req.params.marca);

    productosModel.getProductsByBrand(marca, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error al filtrar por marca' });
        res.json(results);
    });
});

// Filtrar productos nuevos
router.get('/filtro/nuevos', (req, res) => {
    productosModel.getNewProducts((err, results) => {
        if (err) return res.status(500).json({ message: 'Error al filtrar productos nuevos' });
        res.json(results);
    });
});

module.exports = router;
