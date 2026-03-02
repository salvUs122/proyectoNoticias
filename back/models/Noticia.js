const mongoose = require('mongoose');

const noticiaSchema = new mongoose.Schema({
    titulo: { 
        type: String, 
        required: [true, 'El título es obligatorio'] 
    },
    contenido: { 
        type: String, 
        required: [true, 'El contenido es obligatorio'] 
    },
    imagenUrl: { 
        type: String, // Aquí guardaremos la ruta de la imagen
        default: '' 
    },
    fecha: { 
        type: Date, 
        default: Date.now // Se pone la fecha actual automáticamente
    }
});

module.exports = mongoose.model('Noticia', noticiaSchema);