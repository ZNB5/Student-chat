import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { X } from 'lucide-react';

const EditChannelModal = ({ isOpen, title, channel, onClose, onConfirm, loading }) => {
  const { isDark } = useTheme();
  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');

  useEffect(() => {
    if (channel) {
      setChannelName(channel.name || '');
      setChannelDescription(channel.description || '');
    }
  }, [channel, isOpen]);

  const handleConfirm = () => {
    if (channelName.trim()) {
      onConfirm({
        name: channelName,
        description: channelDescription,
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleConfirm();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: isDark ? '#36393f' : '#fff',
          borderRadius: '8px',
          padding: '24px',
          width: '90%',
          maxWidth: '500px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: isDark ? '#dbdee1' : '#2c2f33', fontSize: '18px', fontWeight: '600' }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isDark ? '#b5bac1' : '#72767d',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              color: isDark ? '#b5bac1' : '#72767d',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Nombre del canal
          </label>
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nombre del canal"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${isDark ? '#202225' : '#ccc'}`,
              borderRadius: '4px',
              background: isDark ? '#2c2f33' : '#f5f5f5',
              color: isDark ? '#dbdee1' : '#2c2f33',
              fontSize: '14px',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
            disabled={loading}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              color: isDark ? '#b5bac1' : '#72767d',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Descripción (opcional)
          </label>
          <textarea
            value={channelDescription}
            onChange={(e) => setChannelDescription(e.target.value)}
            placeholder="Descripción del canal"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${isDark ? '#202225' : '#ccc'}`,
              borderRadius: '4px',
              background: isDark ? '#2c2f33' : '#f5f5f5',
              color: isDark ? '#dbdee1' : '#2c2f33',
              fontSize: '14px',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              minHeight: '80px',
              resize: 'vertical',
            }}
            disabled={loading}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: isDark ? '#2c2f33' : '#e3e5e8',
              color: isDark ? '#dbdee1' : '#2c2f33',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
            disabled={loading}
            onMouseEnter={(e) => {
              e.target.style.background = isDark ? '#3c3f45' : '#d0d2d7';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = isDark ? '#2c2f33' : '#e3e5e8';
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: '#5865f2',
              color: '#fff',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s',
              opacity: loading ? 0.7 : 1,
            }}
            disabled={loading || !channelName.trim()}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.background = '#4752c4';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#5865f2';
            }}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditChannelModal;
