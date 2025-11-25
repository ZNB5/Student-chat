import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import '../styles/channel-modal.css';

const ChannelModal = ({
  isOpen,
  title,
  channelName = '',
  members = [],
  onClose,
  onConfirm,
  onDelete,
  onAddMember,
  onRemoveMember,
  loading
}) => {
  const { isDark } = useTheme();
  const [name, setName] = useState(channelName);
  const [memberId, setMemberId] = useState('');
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);

  useEffect(() => {
    setName(channelName);
    setMemberId('');
    setShowAddMemberForm(false);
  }, [channelName, isOpen]);

  const handleConfirm = () => {
    if (name.trim()) {
      onConfirm(name);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && name.trim()) {
      handleConfirm();
    }
  };

  const handleAddMember = () => {
    if (memberId.trim()) {
      onAddMember(memberId);
      setMemberId('');
      setShowAddMemberForm(false);
    }
  };

  const handleKeyPressMemberId = (e) => {
    if (e.key === 'Enter' && memberId.trim()) {
      handleAddMember();
    }
  };

  if (!isOpen) return null;

  const isEditMode = title.includes('Editar');

  return (
    <div className="channel-modal-overlay">
      <div className={`channel-modal-content ${isDark ? 'dark-theme' : 'light-theme'}`}>
        <div className="channel-modal-header">
          <h3>{title}</h3>
          <button className="channel-modal-close-btn" onClick={onClose} disabled={loading}>
            <X size={20} />
          </button>
        </div>

        <div className="channel-modal-body">
          <div className="channel-modal-section">
            <label className="channel-modal-label">Nombre del canal</label>
            <input
              type="text"
              className="channel-modal-input"
              placeholder="Nombre del canal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
              disabled={loading}
            />
          </div>

          {isEditMode && (
            <div className="channel-modal-section">
              <div className="channel-modal-members-header">
                <label className="channel-modal-label">Miembros del canal</label>
                {!showAddMemberForm && (
                  <button
                    className="channel-modal-add-member-btn"
                    onClick={() => setShowAddMemberForm(true)}
                    disabled={loading}
                    title="Agregar miembro"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>

              {showAddMemberForm && (
                <div className="channel-modal-add-member">
                  <input
                    type="text"
                    className="channel-modal-input"
                    placeholder="ID del usuario"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    onKeyPress={handleKeyPressMemberId}
                    autoFocus
                    disabled={loading}
                  />
                  <div className="channel-modal-add-member-actions">
                    <button
                      className="channel-modal-btn channel-modal-btn-small channel-modal-btn-confirm"
                      onClick={handleAddMember}
                      disabled={loading || !memberId.trim()}
                    >
                      Agregar
                    </button>
                    <button
                      className="channel-modal-btn channel-modal-btn-small channel-modal-btn-cancel"
                      onClick={() => {
                        setShowAddMemberForm(false);
                        setMemberId('');
                      }}
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              <div className="channel-modal-members-list">
                {members && members.length > 0 ? (
                  members.map((member) => (
                    <div key={member.user_id || member.id} className="channel-modal-member-item">
                      <div className="channel-modal-member-info">
                        <span className="channel-modal-member-id">{member.user_id || member.id}</span>
                        {member.user_name && (
                          <span className="channel-modal-member-name">{member.user_name}</span>
                        )}
                      </div>
                      <button
                        className="channel-modal-remove-member-btn"
                        onClick={() => onRemoveMember(member.user_id || member.id)}
                        disabled={loading}
                        title="Remover miembro"
                      >
                        <Minus size={14} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="channel-modal-no-members">No hay miembros agregados</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="channel-modal-footer">
          {onDelete && (
            <button
              className="channel-modal-btn channel-modal-btn-delete"
              onClick={onDelete}
              disabled={loading}
              title="Eliminar canal"
            >
              <Trash2 size={16} />
              Eliminar
            </button>
          )}
          <div className="channel-modal-actions">
            <button
              className="channel-modal-btn channel-modal-btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              className="channel-modal-btn channel-modal-btn-confirm"
              onClick={handleConfirm}
              disabled={loading || !name.trim()}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelModal;
