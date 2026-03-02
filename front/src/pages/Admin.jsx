import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Admin.css'; // Crearemos este archivo

const Admin = () => {
    const [titulo, setTitulo] = useState('');
    const [contenido, setContenido] = useState('');
    const [imagen, setImagen] = useState(null);
    const [noticias, setNoticias] = useState([]);
    const [editando, setEditando] = useState(false);
    const [idEditar, setIdEditar] = useState(null);
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [eliminando, setEliminando] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    
    useEffect(() => {
        if (!token) {
            navigate('/login');
        } else {
            cargarNoticias();
        }
    }, [token, navigate]);

    const config = {
        headers: { 'x-auth-token': token }
    };

    const cargarNoticias = async () => {
        try {
            const res = await axios.get('http://localhost:4000/api/noticias');
            setNoticias(res.data);
        } catch (error) {
            console.error("Error al cargar noticias", error);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImagen(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewImage(null);
        }
    };

    const handleSubir = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('contenido', contenido);
        if (imagen) formData.append('imagen', imagen);

        try {
            if (editando) {
                await axios.put(`http://localhost:4000/api/noticias/${idEditar}`, formData, config);
            } else {
                await axios.post('http://localhost:4000/api/noticias', formData, config);
            }
            
            cancelarEdicion();
            e.target.reset();
            cargarNoticias();
            
            // Mostrar notificación flotante
            mostrarNotificacion(editando ? '✅ Noticia actualizada' : '🚀 Noticia publicada', 'success');
        } catch (err) {
            mostrarNotificacion('❌ Error en la operación', 'error');
        } finally {
            setLoading(false);
        }
    };

    const eliminarNoticia = async (id) => {
        setEliminando(true);
        try {
            await axios.delete(`http://localhost:4000/api/noticias/${id}`, config);
            cargarNoticias();
            mostrarNotificacion('🗑️ Noticia eliminada', 'success');
        } catch (error) {
            mostrarNotificacion('No se pudo eliminar la noticia', 'error');
        } finally {
            setEliminando(false);
        }
    };

    const prepararEdicion = (noticia) => {
        setEditando(true);
        setIdEditar(noticia._id);
        setTitulo(noticia.titulo);
        setContenido(noticia.contenido);
        setPreviewImage(noticia.imagenUrl ? `http://localhost:4000${noticia.imagenUrl}` : null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelarEdicion = () => {
        setEditando(false);
        setIdEditar(null);
        setTitulo('');
        setContenido('');
        setImagen(null);
        setPreviewImage(null);
    };

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const mostrarNotificacion = (mensaje, tipo) => {
        // Implementación simple, puedes mejorarla con un toast
        alert(mensaje);
    };

    return (
        <div className="admin-container">
            {/* Header con gradiente */}
            <header className="admin-header">
                <div className="header-content">
                    <div className="logo-section">
                        <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16v16H4z" />
                            <path d="M8 8h8v8H8z" />
                        </svg>
                        <h1>Noticias<span>Admin</span></h1>
                    </div>
                    <button onClick={cerrarSesion} className="logout-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </header>

            <main className="admin-main">
                {/* Formulario con efecto glassmorphism */}
                <form onSubmit={handleSubir} className="noticia-form">
                    <div className="form-header">
                        <h2>{editando ? '✏️ Editar Noticia' : '📝 Crear Nueva Noticia'}</h2>
                        {editando && (
                            <button type="button" onClick={cancelarEdicion} className="cancel-edit-btn">
                                Cancelar edición
                            </button>
                        )}
                    </div>

                    <div className="form-grid">
                        <div className="form-left">
                            <div className="input-group">
                                <label>Título de la noticia</label>
                                <input 
                                    type="text" 
                                    placeholder="Ej: Nuevo descubrimiento científico..."
                                    value={titulo}
                                    onChange={e => setTitulo(e.target.value)} 
                                    required 
                                />
                            </div>

                            <div className="input-group">
                                <label>Contenido</label>
                                <textarea 
                                    placeholder="Escribe el contenido detallado de la noticia..."
                                    value={contenido}
                                    onChange={e => setContenido(e.target.value)} 
                                    required 
                                />
                            </div>
                        </div>

                        <div className="form-right">
                            <div className="input-group">
                                <label>Imagen destacada</label>
                                <div className="image-upload-area">
                                    {previewImage ? (
                                        <div className="image-preview">
                                            <img src={previewImage} alt="Preview" />
                                            <button 
                                                type="button" 
                                                className="remove-image"
                                                onClick={() => {
                                                    setImagen(null);
                                                    setPreviewImage(null);
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="upload-placeholder">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                <circle cx="8.5" cy="8.5" r="1.5" />
                                                <polyline points="21 15 16 10 5 21" />
                                            </svg>
                                            <p>Haz clic para subir una imagen</p>
                                            <span>PNG, JPG, GIF (max. 5MB)</span>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        onChange={handleImageChange} 
                                        accept="image/*"
                                        id="image-upload"
                                    />
                                    {editando && !imagen && !previewImage && (
                                        <p className="edit-hint">* Deja vacío para mantener la imagen actual</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="submit" 
                            className={`submit-btn ${editando ? 'editing' : ''}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="loader"></div>
                            ) : (
                                <>
                                    {editando ? 'Guardar Cambios' : 'Publicar Noticia'}
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="22" y1="2" x2="11" y2="13" />
                                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Lista de noticias con diseño de tarjetas */}
                <section className="noticias-section">
                    <div className="section-header">
                        <h3>📰 Noticias Publicadas</h3>
                        <span className="noticias-count">{noticias.length} artículos</span>
                    </div>

                    {noticias.length > 0 ? (
                        <div className="noticias-grid">
                            {noticias.map(noticia => (
                                <article key={noticia._id} className="noticia-card">
                                    {noticia.imagenUrl && (
                                        <div className="card-image">
                                            <img 
                                                src={`http://localhost:4000${noticia.imagenUrl}`} 
                                                alt={noticia.titulo}
                                                loading="lazy"
                                            />
                                        </div>
                                    )}
                                    <div className="card-content">
                                        <h4>{noticia.titulo}</h4>
                                        <p>{noticia.contenido.substring(0, 100)}...</p>
                                        <div className="card-footer">
                                            <time dateTime={noticia.fecha}>
                                                {new Date(noticia.fecha).toLocaleDateString('es-ES', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </time>
                                            <div className="card-actions">
                                                <button 
                                                    onClick={() => prepararEdicion(noticia)}
                                                    className="edit-btn"
                                                    title="Editar noticia"
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />
                                                        <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
                                                    </svg>
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        if (window.confirm('¿Estás seguro de eliminar esta noticia?')) {
                                                            eliminarNoticia(noticia._id);
                                                        }
                                                    }}
                                                    className="delete-btn"
                                                    title="Eliminar noticia"
                                                    disabled={eliminando}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                        <line x1="10" y1="11" x2="10" y2="17" />
                                                        <line x1="14" y1="11" x2="14" y2="17" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="12" y1="18" x2="12" y2="12" />
                                <line x1="9" y1="15" x2="15" y2="15" />
                            </svg>
                            <h4>No hay noticias publicadas</h4>
                            <p>Comienza creando tu primera noticia usando el formulario de arriba.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Admin;