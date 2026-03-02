const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Leer el token del encabezado (header)
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ message: 'No hay token, permiso no válido' });
    }

    try {
        const cifrado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = cifrado.id;
        next(); // Si el token es bueno, deja pasar a la siguiente función
    } catch (error) {
        res.status(401).json({ message: 'Token no válido' });
    }
};