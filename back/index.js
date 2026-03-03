const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Necesario para manejar rutas de archivos
require('dotenv').config();

// Importamos las rutas de noticias (asegúrate de haber creado routes/noticias.js)
const noticiasRoutes = require('./routes/noticias');

const app = express();

const authRoutes = require('./routes/auth');
// --- Middlewares ---
app.use(cors());
app.use(express.json()); 

// HACER PÚBLICA LA CARPETA DE IMÁGENES
// Esto permite que si entras a http://localhost:4000/uploads/nombre-foto.jpg la puedas ver
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Conexión a MongoDB ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Conectado a MongoDB Atlas'))
    .catch(err => console.error('❌ Error de conexión:', err));

// --- Rutas ---

// Ruta de prueba inicial
app.get('/', (req, res) => {
    res.send('Servidor del Sistema de Noticias corriendo 🚀');
});

// Usar las rutas de noticias bajo el prefijo /api/noticias
app.use('/api/noticias', noticiasRoutes);

app.use('/api/auth', authRoutes);

// --- Configuración del Puerto ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));