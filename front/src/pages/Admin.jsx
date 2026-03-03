import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

/* ─── Barra de herramientas del editor ──────────────────────────── */
const EditorToolbar = ({ onExec }) => {
    const fontSizes = ['1', '2', '3', '4', '5'];
    const fontLabels = ['Pequeño', 'Normal', 'Mediano', 'Grande', 'Muy grande'];

    return (
        <div className="editor-toolbar">
            <div className="toolbar-group">
                <button type="button" title="Negrita" onClick={() => onExec('bold')} className="tb-btn">
                    <strong>B</strong>
                </button>
                <button type="button" title="Cursiva" onClick={() => onExec('italic')} className="tb-btn tb-italic">
                    <em>I</em>
                </button>
                <button type="button" title="Subrayado" onClick={() => onExec('underline')} className="tb-btn tb-underline">
                    U
                </button>
            </div>
            <div className="toolbar-sep" />
            <div className="toolbar-group">
                <button type="button" title="Título 1" onClick={() => onExec('formatBlock', 'h1')} className="tb-btn">
                    H1
                </button>
                <button type="button" title="Título 2" onClick={() => onExec('formatBlock', 'h2')} className="tb-btn">
                    H2
                </button>
                <button type="button" title="Párrafo normal" onClick={() => onExec('formatBlock', 'p')} className="tb-btn">
                    ¶
                </button>
            </div>
            <div className="toolbar-sep" />
            <div className="toolbar-group">
                <select
                    className="tb-select"
                    defaultValue="3"
                    onChange={e => onExec('fontSize', e.target.value)}
                    title="Tamaño de letra"
                >
                    {fontSizes.map((s, i) => (
                        <option key={s} value={s}>{fontLabels[i]}</option>
                    ))}
                </select>
            </div>
            <div className="toolbar-sep" />
            <div className="toolbar-group">
                <button type="button" title="Alinear izquierda" onClick={() => onExec('justifyLeft')} className="tb-btn">
                    ≡
                </button>
                <button type="button" title="Centrar" onClick={() => onExec('justifyCenter')} className="tb-btn">
                    ☰
                </button>
            </div>
            <div className="toolbar-sep" />
            <div className="toolbar-group">
                <button type="button" title="Lista con viñetas" onClick={() => onExec('insertUnorderedList')} className="tb-btn">
                    •≡
                </button>
                <button type="button" title="Lista numerada" onClick={() => onExec('insertOrderedList')} className="tb-btn">
                    1≡
                </button>
            </div>
        </div>
    );
};

/* ─── Componente principal ───────────────────────────────────────── */
const Admin = () => {
    const [titulo, setTitulo] = useState('');
    const [imagen, setImagen] = useState(null);
    const [noticias, setNoticias] = useState([]);
    const [editando, setEditando] = useState(false);
    const [idEditar, setIdEditar] = useState(null);
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [eliminando, setEliminando] = useState(false);
    const [toast, setToast] = useState(null);

    const editorRef = useRef(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
        } else {
            cargarNoticias();
        }
    }, [token, navigate]);

    const config = { headers: { 'x-auth-token': token } };

    const cargarNoticias = async () => {
        try {
            const res = await axios.get('http://localhost:4000/api/noticias');
            setNoticias(res.data);
        } catch (error) {
            console.error("Error al cargar noticias", error);
        }
    };

    const execFormat = useCallback((command, value = null) => {
        editorRef.current?.focus();
        document.execCommand(command, false, value);
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImagen(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        } else {
            setPreviewImage(null);
        }
    };

    const handleSubir = async (e) => {
        e.preventDefault();
        const htmlContent = editorRef.current?.innerHTML || '';
        if (!htmlContent || htmlContent === '<br>') {
            mostrarToast('El contenido no puede estar vacío', 'error');
            return;
        }
        setLoading(true);
        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('contenido', htmlContent);
        if (imagen) formData.append('imagen', imagen);

        try {
            if (editando) {
                await axios.put(`http://localhost:4000/api/noticias/${idEditar}`, formData, config);
            } else {
                await axios.post('http://localhost:4000/api/noticias', formData, config);
            }
            cancelarEdicion();
            cargarNoticias();
            mostrarToast(editando ? 'Noticia actualizada' : 'Noticia publicada', 'success');
        } catch (err) {
            mostrarToast('Error en la operación', 'error');
        } finally {
            setLoading(false);
        }
    };

    const eliminarNoticia = async (id) => {
        setEliminando(true);
        try {
            await axios.delete(`http://localhost:4000/api/noticias/${id}`, config);
            cargarNoticias();
            mostrarToast('Noticia eliminada', 'success');
        } catch (error) {
            mostrarToast('No se pudo eliminar', 'error');
        } finally {
            setEliminando(false);
        }
    };

    const prepararEdicion = (noticia) => {
        setEditando(true);
        setIdEditar(noticia._id);
        setTitulo(noticia.titulo);
        setPreviewImage(noticia.imagenUrl ? `http://localhost:4000${noticia.imagenUrl}` : null);
        if (editorRef.current) {
            editorRef.current.innerHTML = noticia.contenido;
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelarEdicion = () => {
        setEditando(false);
        setIdEditar(null);
        setTitulo('');
        setImagen(null);
        setPreviewImage(null);
        if (editorRef.current) {
            editorRef.current.innerHTML = '';
        }
    };

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const mostrarToast = (mensaje, tipo) => {
        setToast({ mensaje, tipo });
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <div className="admin-container">
            {/* Toast */}
            {toast && (
                <div className={`admin-toast ${toast.tipo}`}>
                    {toast.tipo === 'success' ? '✓' : '✕'} {toast.mensaje}
                </div>
            )}

            {/* Header */}
            <header className="admin-header">
                <div className="admin-header-inner">
                    <div className="admin-logo">
                        <span className="admin-logo-mark">N</span>
                        <span className="admin-logo-text">Panel de redacción</span>
                    </div>
                    <button onClick={cerrarSesion} className="admin-logout-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Salir
                    </button>
                </div>
            </header>

            <main className="admin-main">
                {/* Formulario */}
                <form onSubmit={handleSubir} className="admin-form">
                    <div className="admin-form-header">
                        <h2>{editando ? 'Editar noticia' : 'Nueva noticia'}</h2>
                        {editando && (
                            <button type="button" onClick={cancelarEdicion} className="admin-cancel-btn">
                                Cancelar
                            </button>
                        )}
                    </div>

                    <div className="admin-form-grid">
                        {/* Columna izquierda */}
                        <div className="admin-form-left">
                            <div className="admin-field">
                                <label>Título</label>
                                <input
                                    type="text"
                                    placeholder="Título de la noticia"
                                    value={titulo}
                                    onChange={e => setTitulo(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="admin-field">
                                <label>Contenido</label>
                                <div className="editor-wrap">
                                    <EditorToolbar onExec={execFormat} />
                                    <div
                                        ref={editorRef}
                                        contentEditable
                                        suppressContentEditableWarning
                                        className="editor-body"
                                        data-placeholder="Escribe el contenido de la noticia..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Columna derecha */}
                        <div className="admin-form-right">
                            <div className="admin-field">
                                <label>Imagen</label>
                                <div className="admin-upload-area">
                                    {previewImage ? (
                                        <div className="admin-image-preview">
                                            <img src={previewImage} alt="Preview" />
                                            <button
                                                type="button"
                                                className="admin-remove-image"
                                                onClick={() => { setImagen(null); setPreviewImage(null); }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="admin-upload-placeholder">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <rect x="3" y="3" width="18" height="18" rx="1" />
                                                <circle cx="8.5" cy="8.5" r="1.5" />
                                                <polyline points="21 15 16 10 5 21" />
                                            </svg>
                                            <p>Clic para subir imagen</p>
                                            <span>PNG, JPG (máx. 5MB)</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                    />
                                    {editando && !imagen && !previewImage && (
                                        <p className="admin-edit-hint">Deja vacío para mantener la imagen actual</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="admin-form-actions">
                        <button
                            type="submit"
                            className={`admin-submit-btn ${editando ? 'editing' : ''}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="admin-loader"></div>
                            ) : (
                                <>{editando ? 'Guardar cambios' : 'Publicar noticia'}</>
                            )}
                        </button>
                    </div>
                </form>

                {/* Lista de noticias */}
                <section className="admin-noticias-section">
                    <div className="admin-section-header">
                        <h3>Noticias publicadas</h3>
                        <span className="admin-count">{noticias.length}</span>
                    </div>

                    {noticias.length > 0 ? (
                        <div className="admin-noticias-list">
                            {noticias.map(noticia => (
                                <article key={noticia._id} className="admin-noticia-row">
                                    {noticia.imagenUrl && (
                                        <div className="admin-row-img">
                                            <img
                                                src={`http://localhost:4000${noticia.imagenUrl}`}
                                                alt={noticia.titulo}
                                                loading="lazy"
                                            />
                                        </div>
                                    )}
                                    <div className="admin-row-content">
                                        <h4>{noticia.titulo}</h4>
                                        <time>
                                            {new Date(noticia.fecha).toLocaleDateString('es-ES', {
                                                day: 'numeric', month: 'short', year: 'numeric'
                                            })}
                                        </time>
                                    </div>
                                    <div className="admin-row-actions">
                                        <button
                                            onClick={() => prepararEdicion(noticia)}
                                            className="admin-edit-btn"
                                            title="Editar"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />
                                                <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('¿Eliminar esta noticia?')) {
                                                    eliminarNoticia(noticia._id);
                                                }
                                            }}
                                            className="admin-delete-btn"
                                            title="Eliminar"
                                            disabled={eliminando}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="admin-empty">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                            </svg>
                            <p>Aún no hay noticias publicadas</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Admin;