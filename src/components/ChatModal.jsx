import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { X, Trash2 } from 'lucide-react';
import './ChatModal.css';

const ChatModal = ({
  isOpen,
  title,
  threadTitle = '',
  onClose,
  onConfirm,
  onDelete,
  loading = false,
}) => {
  const { isDark } = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setInputValue(threadTitle);
    setError('');
  }, [threadTitle, isOpen]);

  const handleConfirm = () => {
    if (!inputValue.trim()) {
      setError('El título del hilo no puede estar vacío');
      return;
    }
    onConfirm(inputValue);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isDark ? 'dark' : 'light'}`} onClick={onClose}>
      <div className={`modal-content thread-modal ${isDark ? 'dark' : 'light'}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button
            className="close-btn"
            onClick={onClose}
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <label className="modal-label">Título del hilo</label>
          <input
            type="text"
            className={`modal-input ${error ? 'error' : ''}`}
            placeholder="Ej: Discusión sobre el proyecto"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError('');
            }}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading) {
                handleConfirm();
              }
            }}
          />
          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="modal-footer">
          {onDelete && (
            <button
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={loading}
              title="Eliminar hilo"
            >
              <Trash2 size={16} />
              Eliminar
            </button>
          )}
          <div className="footer-buttons">
            <button
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
