const { Router } = require('express');
const router = Router();
const usuariosModel = require('../models/usuariosModel');

router.get('/usuarios', async (req, res) => {
    var result;
    result = await usuariosModel.traerUsuarios() ;
    res.json(result);
});

router.get('/usuarios/:email', async (req, res) => {
    const email = req.params.email;

    try {
        const result = await usuariosModel.traerUsuario(email);

        if (!result || result.length === 0) { // Si no hay resultado, usuario no existe
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json(result[0]);

    } catch (error) {
        res.status(500).json({ error: "Error en el servidor" });
    }
});


router.get('/usuarios/:email/:contrasena', async (req, res) => {
    const email = req.params.email;
    const contrasena = req.params.contrasena;
    var result;
    result = await usuariosModel.validarUsuario(email, contrasena) ;
    res.json(result);
});

router.post('/usuarios', async (req, res) => {
    const nombre = req.body.nombre;
    const email = req.body.email;
    const contrasena = req.body.contrasena;

    var result = await usuariosModel.crearUsuario(nombre, email, contrasena);
    res.status(201).json({ mensaje: "usuario creado" });
});

// router.delete('/usuarios/:id', async (req, res) => {
//     var result;
//     result = await usuariosModel.eliminarUsuario(id) ;
//     res.json(result);
// });


router.delete('/usuarios/:email', async (req, res) => {
    const email = req.params.email;

    try {
        const eliminado = await usuariosModel.eliminarUsuarioPorEmail(email);

        if (eliminado) {
            res.json({ message: `Usuario con email ${email} eliminado correctamente` });
        } else {
            res.status(404).json({ error: "Usuario no encontrado" });
        }
    } catch (error) {
        console.error("🔥 Error al eliminar usuario:", error);
        res.status(500).json({ error: "Error en el servidor al eliminar usuario" });
    }
});

// router.put('/usuarios/:id/rol', async (req, res) => {
//     const id = Number(req.params.id);  // Convertimos el ID a número
//     const { rol } = req.body; // Extraemos el nuevo rol del body

//     try {
//         const result = await usuariosModel.actualizarRol(id, rol);

//         if (result.affectedRows > 0) {
//             res.json({ message: `Rol del usuario con ID ${id} actualizado a '${rol}'` });
//         } else {
//             res.status(404).json({ error: `Usuario con ID ${id} no encontrado` });
//         }
//     } catch (error) {
//         res.status(500).json({ error: 'Error al actualizar el rol' });
//     }
// });

router.put('/usuarios/:id/rol', async (req, res) => {
    const id = Number(req.params.id);
    const { rol } = req.body;

    console.log(`⚡ Recibida petición PUT para actualizar el rol del usuario con ID: ${id}`);
    console.log(`📌 Rol recibido en el body: '${rol}'`); // <-- IMPORTANTE: Ver qué valor llega

    if (!rol || rol.trim() === "" || (rol !== "admin" && rol !== "usuario")) {
        console.log("⛔ Error: Rol inválido o vacío.");
        return res.status(400).json({ error: "Rol inválido o vacío" });
    }

    try {
        const result = await usuariosModel.actualizarRol(id, rol);
        console.log("📌 Resultado UPDATE:", result);

        if (result.affectedRows > 0) {
            console.log(`✅ Rol del usuario con ID ${id} actualizado a '${rol}'`);
            res.json({ message: `Rol del usuario con ID ${id} actualizado a '${rol}'` });
        } else {
            console.log("❌ Usuario no encontrado.");
            res.status(404).json({ error: `Usuario con ID ${id} no encontrado` });
        }
    } catch (error) {
        console.error("🔥 Error al actualizar el rol:", error);
        res.status(500).json({ error: "Error al actualizar el rol" });
    }
});



router.post('/login', async (req, res) => {
    const { email, contrasena } = req.body;
    try {
        const usuario = await usuariosModel.iniciarSesion(email, contrasena);

        if (usuario) {
            res.json({ message: "Inicio de sesión exitoso", usuario });
        } else {
            res.status(401).json({ error: "Email o contraseña incorrectos" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error en el servidor al iniciar sesión" });
    }
});

module.exports = router;
