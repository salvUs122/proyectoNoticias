import { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css';

const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
};

const Home = () => {
    const [noticias, setNoticias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [noticiaSeleccionada, setNoticiaSeleccionada] = useState(null);

    useEffect(() => {
        cargarNoticias();
    }, []);

    const cargarNoticias = async () => {
        try {
            const res = await axios.get('https://proyectonoticias.onrender.com/api/noticias');
            setNoticias(res.data);
        } catch (error) {
            console.error("Error al cargar noticias", error);
        } finally {
            setCargando(false);
        }
    };

    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getExcerpt = (contenido, max) => {
        const text = stripHtml(contenido);
        return text.length > max ? text.substring(0, max) + '...' : text;
    };

    if (cargando) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>Cargando noticias...</p>
            </div>
        );
    }

    return (
        <div className="home-container">
            {/* Header */}
            <header className="home-header">
                <div className="header-inner">
                    <div className="header-top">
                        <span className="header-date">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="header-brand">
                        <h1 className="brand-name">El Noticiero</h1>
                        <p className="brand-tagline">Información que importa</p>
                    </div>
                </div>
                <div className="header-divider">
                    <div className="divider-accent"></div>
                </div>
            </header>

            <main className="home-main">
                {noticias.length > 0 ? (
                    <>
                        {/* Noticia destacada */}
                        {noticias[0] && (
                            <section
                                className="noticia-destacada"
                                onClick={() => setNoticiaSeleccionada(noticias[0])}
                            >
                                <div className="destacada-imagen-wrap">
                                    {noticias[0].imagenUrl ? (
                                        <img
                                            src={`https://proyectonoticias.onrender.com${noticias[0].imagenUrl}`}
                                            alt={noticias[0].titulo}
                                        />
                                    ) : (
                                        <div className="destacada-imagen-placeholder">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                                <rect x="3" y="3" width="18" height="18" rx="1" />
                                                <circle cx="8.5" cy="8.5" r="1.5" />
                                                <polyline points="21 15 16 10 5 21" />
                                            </svg>
                                        </div>
                                    )}
                                    <span className="badge-destacada">Destacado</span>
                                </div>
                                <div className="destacada-content">
                                    <time className="noticia-fecha">{formatFecha(noticias[0].fecha)}</time>
                                    <h2 className="destacada-titulo">{noticias[0].titulo}</h2>
                                    <p className="destacada-excerpt">{getExcerpt(noticias[0].contenido, 250)}</p>
                                    <span className="leer-link">Leer artículo completo →</span>
                                </div>
                            </section>
                        )}

                        {/* Lista de noticias */}
                        <section className="noticias-lista">
                            <div className="lista-header">
                                <h2 className="lista-titulo">Últimas noticias</h2>
                                <div className="lista-linea"></div>
                            </div>
                            <div className="lista-items">
                                {noticias.slice(1).map((noticia, idx) => (
                                    <article
                                        key={noticia._id}
                                        className="noticia-item"
                                        onClick={() => setNoticiaSeleccionada(noticia)}
                                    >
                                        <div className="item-imagen-wrap">
                                            {noticia.imagenUrl ? (
                                                <img
                                                    src={`https://proyectonoticias.onrender.com${noticia.imagenUrl}`}
                                                    alt={noticia.titulo}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="item-imagen-placeholder">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                                        <rect x="3" y="3" width="18" height="18" rx="1" />
                                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                                        <polyline points="21 15 16 10 5 21" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="item-content">
                                            <time className="noticia-fecha">{formatFecha(noticia.fecha)}</time>
                                            <h3 className="item-titulo">{noticia.titulo}</h3>
                                            <p className="item-excerpt">{getExcerpt(noticia.contenido, 130)}</p>
                                            <span className="leer-link">Leer más →</span>
                                        </div>
                                        {idx < noticias.length - 2 && <div className="item-separador" />}
                                    </article>
                                ))}
                            </div>
                        </section>
                    </>
                ) : (
                    <div className="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <h3>No hay noticias aún</h3>
                        <p>Pronto publicaremos nuevas noticias</p>
                    </div>
                )}
            </main>

            {/* Modal expandido */}
            {noticiaSeleccionada && (
                <div className="modal-overlay" onClick={() => setNoticiaSeleccionada(null)}>
                    <div className="modal-contenido" onClick={e => e.stopPropagation()}>
                        <button className="modal-cerrar" onClick={() => setNoticiaSeleccionada(null)}>
                            ×
                        </button>
                        {noticiaSeleccionada.imagenUrl && (
                            <div className="modal-imagen">
                                <img
                                    src={`https://proyectonoticias.onrender.com${noticiaSeleccionada.imagenUrl}`}
                                    alt={noticiaSeleccionada.titulo}
                                />
                            </div>
                        )}
                        <div className="modal-texto">
                            <time className="noticia-fecha">{formatFecha(noticiaSeleccionada.fecha)}</time>
                            <h2 className="modal-titulo">{noticiaSeleccionada.titulo}</h2>
                            <div
                                className="modal-cuerpo"
                                dangerouslySetInnerHTML={{ __html: noticiaSeleccionada.contenido }}
                            />
                        </div>
                    </div>
                </div>
            )}

            <footer className="home-footer">
                <div className="footer-inner">
                    <span className="footer-brand">El Noticiero</span>
                    <span className="footer-sep">·</span>
                    <span>Salvador Alanes</span>
                </div>
            </footer>
        </div>
    );
};

export default Home;