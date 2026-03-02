const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Noticia = require('../models/Noticia');
const auth = require('../middleware/authMiddleware'); // El candado de seguridad

// 1. Configuración de almacenamiento de imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        // Nombre: marca de tiempo + extensión original (ej: 174095.jpg)
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const upload = multer({ storage });

// --- RUTAS PÚBLICAS ---

// OBTENER TODAS LAS NOTICIAS
router.get('/', async (req, res) => {
    try {
        const noticias = await Noticia.find().sort({ fecha: -1 });
        res.json(noticias);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// OBTENER UNA SOLA NOTICIA (Por ID)
router.get('/:id', async (req, res) => {
    try {
        const noticia = await Noticia.findById(req.params.id);
        if (!noticia) return res.status(404).json({ message: 'Noticia no encontrada' });
        res.json(noticia);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- RUTAS PROTEGIDAS (Requieren Token x-auth-token) ---

// CREAR NOTICIA
// Agregamos 'auth' antes de 'upload' para verificar identidad primero
router.post('/', auth, upload.single('imagen'), async (req, res) => {
    try {
        const { titulo, contenido } = req.body;
        const nuevaNoticia = new Noticia({
            titulo,
            contenido,
            imagenUrl: req.file ? `/uploads/${req.file.filename}` : ''
        });
        await nuevaNoticia.save();
        res.status(201).json(nuevaNoticia);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// EDITAR NOTICIA
router.put('/:id', auth, upload.single('imagen'), async (req, res) => {
    try {
        const { titulo, contenido } = req.body;
        let updateData = { titulo, contenido };

        // Si el admin sube una nueva foto, actualizamos la ruta
        if (req.file) {
            updateData.imagenUrl = `/uploads/${req.file.filename}`;
        }

        const noticiaEditada = await Noticia.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true } // Para que devuelva la noticia ya actualizada
        );

        res.json(noticiaEditada);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ELIMINAR NOTICIA
router.delete('/:id', auth, async (req, res) => {
    try {
        const noticia = await Noticia.findById(req.params.id);
        if (!noticia) return res.status(404).json({ message: 'No existe esa noticia' });

        await Noticia.findByIdAndDelete(req.params.id);
        res.json({ message: 'Noticia eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;