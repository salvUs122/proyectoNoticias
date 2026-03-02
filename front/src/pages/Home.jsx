import { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css';

const Home = () => {
    const [noticias, setNoticias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [noticiaSeleccionada, setNoticiaSeleccionada] = useState(null);

    useEffect(() => {
        cargarNoticias();
    }, []);

    const cargarNoticias = async () => {
        try {
            const res = await axios.get('http://localhost:4000/api/noticias');
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
            {/* Header minimalista */}
            <header className="home-header">
                <div className="header-content">
                    <div className="logo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M4 4h16v16H4z" />
                            <path d="M8 8h8v8H8z" />
                        </svg>
                        <h1>El Noticiero</h1>
                    </div>
                </div>
            </header>

            <main className="home-main">
                {noticias.length > 0 ? (
                    <>
                        {/* Noticia destacada */}
                        {noticias[0] && (
                            <section className="noticia-destacada">
                                <div className="destacada-content">
                                    <span className="destacada-badge">Destacado</span>
                                    <h2>{noticias[0].titulo}</h2>
                                    <time>{formatFecha(noticias[0].fecha)}</time>
                                    <p>{noticias[0].contenido.substring(0, 200)}...</p>
                                    <button 
                                        className="leer-mas-btn"
                                        onClick={() => setNoticiaSeleccionada(noticias[0])}
                                    >
                                        Leer más
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                            <polyline points="12 5 19 12 12 19" />
                                        </svg>
                                    </button>
                                </div>
                                {noticias[0].imagenUrl ? (
                                    <div className="destacada-imagen">
                                        <img 
                                            src={`http://localhost:4000${noticias[0].imagenUrl}`} 
                                            alt={noticias[0].titulo}
                                        />
                                    </div>
                                ) : (
                                    <div className="destacada-imagen" />
                                )}
                            </section>
                        )}

                        {/* Grid de noticias */}
                        <section className="noticias-grid">
                            <h2 className="grid-title">Últimas noticias</h2>
                            <div className="grid-container">
                                {noticias.slice(1).map(noticia => (
                                    <article key={noticia._id} className="noticia-card">
                                        {noticia.imagenUrl ? (
                                            <div className="card-imagen">
                                                <img 
                                                    src={`http://localhost:4000${noticia.imagenUrl}`} 
                                                    alt={noticia.titulo}
                                                    loading="lazy"
                                                />
                                            </div>
                                        ) : (
                                            <div className="card-imagen sin-imagen">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                                    <polyline points="21 15 16 10 5 21" />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="card-contenido">
                                            <time>{formatFecha(noticia.fecha)}</time>
                                            <h3>{noticia.titulo}</h3>
                                            <p>{noticia.contenido.substring(0, 100)}...</p>
                                            <button 
                                                className="card-btn"
                                                onClick={() => setNoticiaSeleccionada(noticia)}
                                            >
                                                Leer más
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                    <line x1="5" y1="12" x2="19" y2="12" />
                                                    <polyline points="12 5 19 12 12 19" />
                                                </svg>
                                            </button>
                                        </div>
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
                            <line x1="12" y1="18" x2="12" y2="12" />
                            <line x1="9" y1="15" x2="15" y2="15" />
                        </svg>
                        <h3>No hay noticias</h3>
                        <p>Pronto publicaremos nuevas noticias</p>
                    </div>
                )}
            </main>

            {/* Modal */}
            {noticiaSeleccionada && (
                <div className="modal-overlay" onClick={() => setNoticiaSeleccionada(null)}>
                    <div className="modal-contenido" onClick={e => e.stopPropagation()}>
                        <button 
                            className="modal-cerrar"
                            onClick={() => setNoticiaSeleccionada(null)}
                        >
                            ×
                        </button>
                        {noticiaSeleccionada.imagenUrl && (
                            <div className="modal-imagen">
                                <img 
                                    src={`http://localhost:4000${noticiaSeleccionada.imagenUrl}`} 
                                    alt={noticiaSeleccionada.titulo}
                                />
                            </div>
                        )}
                        <div className="modal-texto">
                            <time>{formatFecha(noticiaSeleccionada.fecha)}</time>
                            <h2>{noticiaSeleccionada.titulo}</h2>
                            <p>{noticiaSeleccionada.contenido}</p>
                        </div>
                    </div>
                </div>
            )}

            <footer className="home-footer">
                <p>salvador alanes</p>
            </footer>
        </div>
    );
};

export default Home;