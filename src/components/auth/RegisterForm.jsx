import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useRegister } from '../../hooks/useRegister';
import './auth.css';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    full_name: '',
  });
  const [validationErrors, setValidationErrors] = useState({});
  const { handleRegister, loading, error } = useRegister();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = 'Email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (!formData.username) {
      errors.username = 'Usuario es requerido';
    } else if (formData.username.length < 3) {
      errors.username = 'Usuario debe tener al menos 3 caracteres';
    }

    if (!formData.password) {
      errors.password = 'Contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'Contraseña debe tener al menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const userData = {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        full_name: formData.full_name || undefined,
      };
      await handleRegister(userData);
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  return (
    <div className={`auth-container ${isDark ? 'dark-theme' : 'light-theme'}`}>
      <div className="auth-card">
        <h2 className="auth-title">Registrarse</h2>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              disabled={loading}
              required
            />
            {validationErrors.email && (
              <div className="error-message">{validationErrors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="tu_usuario"
              disabled={loading}
              required
            />
            {validationErrors.username && (
              <div className="error-message">{validationErrors.username}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Tu contraseña"
              disabled={loading}
              required
            />
            {validationErrors.password && (
              <div className="error-message">{validationErrors.password}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirma tu contraseña"
              disabled={loading}
              required
            />
            {validationErrors.confirmPassword && (
              <div className="error-message">{validationErrors.confirmPassword}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="full_name">Nombre Completo (Opcional)</label>
            <input
              id="full_name"
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Tu nombre completo"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <p className="auth-link">
          ¿Ya tienes cuenta?{' '}
          <button
            type="button"
            className="link-button"
            onClick={() => navigate('/login')}
          >
            Iniciar sesión aquí
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
