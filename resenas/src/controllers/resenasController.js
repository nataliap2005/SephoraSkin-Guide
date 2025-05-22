const express = require('express');
const router = express.Router();
const axios = require('axios');
const resenasModel = require('../models/resenasModel');

const USUARIOS_MS_URL = "http://sephora_usuarios:3001/usuarios";
const PRODUCTOS_MS_URL = "http://sephora_productos:3000/productos";

// ==============================
// Funciones auxiliares
// ==============================
const verificarUsuario = async (email) => {
    try {
        const resp = await axios.get(`${USUARIOS_MS_URL}/${email}`);
        if (!resp.data || Object.keys(resp.data).length === 0) {
            throw new Error('Usuario no encontrado');
        }
        return resp.data;
    } catch (err) {
        if (err.response && err.response.status === 404) {
            throw new Error('Usuario no encontrado');
        }
        throw new Error('Error al verificar usuario');
    }
};

const verificarProducto = async (nombreProducto) => {
    try {
        const resp = await axios.get(`${PRODUCTOS_MS_URL}/${encodeURIComponent(nombreProducto)}`);
        if (!resp.data || Object.keys(resp.data).length === 0) {
            throw new Error('Producto no encontrado');
        }
        return resp.data;
    } catch (err) {
        if (err.response && err.response.status === 404) {
            throw new Error('Producto no encontrado');
        }
        throw new Error('Error al verificar producto');
    }
};

// ==============================
// Crear o actualizar reseña
// ==============================
router.post('/resenas', async (req, res) => {
    try {
        const { nombreCliente, emailCliente, nombreProductos, comentarios, rating } = req.body;

        if (!nombreCliente || !emailCliente || !nombreProductos || !comentarios || !rating) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }

        await verificarUsuario(emailCliente);
        await verificarProducto(nombreProductos);

        await resenasModel.crearResena(req.body);
        res.status(201).json({ message: 'Reseña creada o actualizada correctamente' });
    } catch (error) {
        if (error.message === 'Usuario no encontrado' || error.message === 'Producto no encontrado') {
            return res.status(404).json({ error: error.message });
        }

        console.error('❌ Error al crear reseña:', error.message);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
});

// ==============================
// Obtener reseñas por producto
// ==============================
router.get('/resenas/:nombreProductos', async (req, res) => {
    try {
        const { nombreProductos } = req.params;

        await verificarProducto(nombreProductos);
        const result = await resenasModel.obtenerResenasDeProducto(nombreProductos);

        res.status(200).json(result);
    } catch (error) {
        if (error.message === 'Producto no encontrado') {
            return res.status(404).json({ error: error.message });
        }

        res.status(500).json({ message: 'Error al obtener reseñas de producto', error: error.message });
    }
});

// ==============================
// Obtener reseñas por usuario
// ==============================
router.get('/resenas/usuarios/:emailCliente', async (req, res) => {
    try {
        const { emailCliente } = req.params;

        await verificarUsuario(emailCliente);
        const resenas = await resenasModel.obtenerResenasDeUsuario(emailCliente);

        res.status(200).json({ emailCliente, resenas });
    } catch (error) {
        if (error.message === 'Usuario no encontrado') {
            return res.status(404).json({ error: error.message });
        }

        console.error("❌ Error al obtener reseñas del usuario:", error.message);
        res.status(500).json({ error: "Error interno del servidor", message: error.message });
    }
});

// ==============================
// Eliminar reseña del usuario
// ==============================
router.delete('/eliminar/:emailCliente', async (req, res) => {
    try {
        const { emailCliente } = req.params;

        await verificarUsuario(emailCliente);

        const result = await resenasModel.eliminarResenaPropia(emailCliente);
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Reseñas eliminadas con éxito' });
        } else {
            res.status(404).json({ message: 'No se encontró ninguna reseña con ese email' });
        }
    } catch (error) {
        if (error.message === 'Usuario no encontrado') {
            return res.status(404).json({ error: error.message });
        }

        console.error('❌ Error al eliminar reseña:', error.message);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
});

// Eliminar reseña específica por email y nombre de producto
router.delete('/eliminar/:emailCliente/:nombreProductos', async (req, res) => {
    try {
        const { emailCliente, nombreProductos } = req.params;

        // Verificaciones
        await verificarUsuario(emailCliente);
        await verificarProducto(nombreProductos);

        // Eliminar reseña puntual
        const result = await resenasModel.eliminarResenaPorUsuarioYProducto(emailCliente, nombreProductos);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Reseña eliminada con éxito' });
        } else {
            res.status(404).json({ message: 'No se encontró ninguna reseña con ese email y producto' });
        }
    } catch (error) {
        if (error.message === 'Usuario no encontrado' || error.message === 'Producto no encontrado') {
            return res.status(404).json({ error: error.message });
        }

        console.error('❌ Error al eliminar la reseña:', error.message);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
});

module.exports = router;
