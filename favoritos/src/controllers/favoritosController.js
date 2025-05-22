const express = require('express');
const router = express.Router();
const axios = require('axios');
const favoritosModel = require('../models/favoritosModel');

const USUARIOS_SERVICE_URL = "http://sephora_usuarios:3001/usuarios";
const PRODUCTOS_SERVICE_URL = "http://sephora_productos:3000/productos";

// 🟢 Agregar un producto a favoritos
router.post('/favoritos', async (req, res) => {
    const { email, productName } = req.body;

    if (!email || !productName) {
        return res.status(400).json({ error: "Se requieren email y nombre de producto" });
    }

    try {
        console.log("🔎 Verificando usuario:", email);
        const usuarioResponse = await axios.get(`${USUARIOS_SERVICE_URL}/${encodeURIComponent(email)}`);
        const usuario = usuarioResponse.data;

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        console.log("🔎 Verificando producto:", productName);
        const productoResponse = await axios.get(`${PRODUCTOS_SERVICE_URL}/${encodeURIComponent(productName)}`);
        const producto = productoResponse.data;

        if (!producto || !producto.product_name) {
            return res.status(404).json({ error: "Producto no encontrado o sin nombre válido" });
        }

        console.log("✅ Agregando favorito:", usuario.email, producto.product_name);
        await favoritosModel.agregarFavorito(usuario.email, producto.product_name);

        res.status(201).json({ mensaje: "Producto agregado a favoritos" });
    } catch (error) {
        console.error("❌ Error agregando a favoritos:", error.message);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// 🔴 Eliminar un producto de favoritos
router.delete('/favoritos/:email/:productName', async (req, res) => {
    const { email, productName } = req.params;

    if (!email || !productName) {
        return res.status(400).json({ error: "Se requieren email y nombre de producto" });
    }

    try {
        console.log("🔎 Verificando usuario:", email);
        const usuarioResponse = await axios.get(`${USUARIOS_SERVICE_URL}/${encodeURIComponent(email)}`);
        const usuario = usuarioResponse.data;

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        console.log("🔎 Verificando producto:", productName);
        const productoResponse = await axios.get(`${PRODUCTOS_SERVICE_URL}/${encodeURIComponent(productName)}`);
        const producto = productoResponse.data;

        if (!producto || !producto.product_name) {
            return res.status(404).json({ error: "Producto no encontrado o sin nombre válido" });
        }

        console.log("🗑️ Eliminando favorito:", email, productName);
        await favoritosModel.eliminarFavorito(email, productName);
        res.status(200).json({ mensaje: "Producto eliminado de favoritos" });
    } catch (error) {
        console.error("❌ Error eliminando de favoritos:", error.message);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// 🟡 Obtener todos los productos favoritos de un usuario
router.get('/favoritos/:email', async (req, res) => {
    const email = req.params.email;

    try {
        console.log("🔎 Verificando usuario:", email);
        const usuarioResponse = await axios.get(`${USUARIOS_SERVICE_URL}/${encodeURIComponent(email)}`);
        const usuario = usuarioResponse.data;

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        console.log("📋 Obteniendo favoritos de:", email);
        const favoritos = await favoritosModel.obtenerFavoritosPorUsuario(email);
        res.json({ email, favoritos });
    } catch (error) {
        console.error("❌ Error obteniendo favoritos:", error.message);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// 🔍 Obtener cantidad de usuarios que marcaron como favorito un producto
router.get('/favoritos/productos/:nombreProducto', async (req, res) => {
    try {
        const { nombreProducto } = req.params;
        console.log(`🔍 Buscando favoritos del producto: ${nombreProducto}`);

        const resultado = await favoritosModel.obtenerFavoritosPorProducto(nombreProducto);

        if (!resultado) {
            return res.status(404).json({ message: "Producto no encontrado en favoritos" });
        }

        res.status(200).json({
            product_name: resultado.product_name,
            cantidad_usuarios: resultado.cantidad_usuarios
        });
    } catch (error) {
        console.error("❌ Error en la ruta /favoritos/:nombreProducto", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

module.exports = router;

