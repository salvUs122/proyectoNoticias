import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError('');
        
        try {
            const res = await axios.post('http://localhost:4000/api/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            navigate('/admin');
        } catch (err) {
            setError('Credenciales incorrectas');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-decoration">
                <div className="decoration-1"></div>
                <div className="decoration-2"></div>
                <div className="decoration-3"></div>
            </div>
            
            <div className="login-card">
                <div className="login-header">
                    <div className="login-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16v16H4z" />
                            <path d="M8 8h8v8H8z" />
                        </svg>
                    </div>
                    <h2>Acceso Administrador</h2>
                    <p>Ingresa tus credenciales para continuar</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-group">
                        <label>Correo electrónico</label>
                        <div className="input-wrapper">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16v16H4z" />
                                <polyline points="22 6 12 13 2 6" />
                            </svg>
                            <input 
                                type="email" 
                                placeholder="tu@email.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} 
                                required
                                disabled={cargando}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Contraseña</label>
                        <div className="input-wrapper">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} 
                                required
                                disabled={cargando}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="error-message">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="login-btn"
                        disabled={cargando}
                    >
                        {cargando ? (
                            <div className="loader"></div>
                        ) : (
                            <>
                                Iniciar Sesión
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M15 3h6v6" />
                                    <path d="M10 14 21 3" />
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                </svg>
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>© 2024 El Noticiero - Panel Administrativo</p>
                </div>
            </div>
        </div>
    );
};

export default Login;