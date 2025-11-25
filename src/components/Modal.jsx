import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import '../styles/modal.css';

const Modal = ({ isOpen, title, message, type = 'info', onClose, onConfirm, confirmText = 'Confirmar', cancelText = 'Cancelar', showCancel = true }) => {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className={`modal-content modal-${type} ${isDark ? 'dark-theme' : 'light-theme'}`}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          {showCancel && (
            <button className="modal-btn modal-btn-cancel" onClick={onClose}>
              {cancelText}
            </button>
          )}
          <button className={`modal-btn modal-btn-${type}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
