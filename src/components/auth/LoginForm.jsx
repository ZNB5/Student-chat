import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useLogin } from '../../hooks/useLogin';
import './auth.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });
  const { handleLogin, loading, error } = useLogin();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleLogin(formData.usernameOrEmail, formData.password);
      navigate('/chat');
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className={`auth-container ${isDark ? 'dark-theme' : 'light-theme'}`}>
      <div className="auth-card">
        <h2 className="auth-title">Iniciar Sesión</h2>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="usernameOrEmail">Usuario o Email</label>
            <input
              id="usernameOrEmail"
              type="text"
              name="usernameOrEmail"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              placeholder="usuario"
              disabled={loading}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="contraseña"
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="auth-link">
          ¿No tienes cuenta?{' '}
          <button
            type="button"
            className="link-button"
            onClick={() => navigate('/register')}
          >
            Registrarse aquí
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
