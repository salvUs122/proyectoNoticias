const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- RUTA TEMPORAL PARA CREAR TU ADMIN ---
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const nuevoUsuario = new Usuario({
            email,
            password: hashedPassword
        });

        await nuevoUsuario.save();
        res.status(201).json({ message: "Usuario administrador creado con éxito" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// --- RUTA DE LOGIN (La que usará el Front siempre) ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 1. ¿Existe el usuario?
        const usuario = await Usuario.findOne({ email });
        if (!usuario) return res.status(400).json({ message: "Datos incorrectos" });

        // 2. ¿La contraseña coincide?
        const esValida = await bcrypt.compare(password, usuario.password);
        if (!esValida) return res.status(400).json({ message: "Datos incorrectos" });

        // 3. Crear el Token (El pase VIP)
        const token = jwt.sign(
            { id: usuario._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' } // El token dura un día
        );

        res.json({ token, user: { email: usuario.email } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;