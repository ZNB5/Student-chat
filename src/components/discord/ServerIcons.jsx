import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useChannels } from '../../context/ChannelsContext';
import { useThreads } from '../../context/ThreadsContext';
import { useAuth } from '../../context/AuthContext';
import { Plus } from 'lucide-react';
import ChannelModal from '../ChannelModal';
import EditChannelModal from '../EditChannelModal';
import InviteMemberModal from '../InviteMemberModal';
import Modal from '../Modal';
import { createChannel, updateChannel, deleteChannel } from '../../api/channelsApi';
import { addChannelMember } from '../../api/membersApi';

const ServerIcons = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { channels, selectedChannel, selectChannel, addChannel, removeChannel } = useChannels();
  const { clearThreads } = useThreads();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [contextMenu, setContextMenu] = useState({ isOpen: false, x: 0, y: 0, channelId: null });
  const [editingChannel, setEditingChannel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    action: null,
    channelId: null,
  });

  const handleSelectChannel = (channel) => {
    selectChannel(channel);
    clearThreads();
  };

  const closeContextMenu = () => {
    setContextMenu({ isOpen: false, x: 0, y: 0, channelId: null });
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu({ isOpen: false, x: 0, y: 0, channelId: null });
    };

    if (contextMenu.isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [contextMenu.isOpen]);

  const handleCreateChannel = async (channelName) => {
    setLoading(true);
    try {
      const newChannel = await createChannel({
        name: channelName,
        description: '',
        owner_id: user.id
      });
      addChannel(newChannel);
      setShowCreateModal(false);
      setModalState({
        isOpen: true,
        title: 'Éxito',
        message: 'Canal creado exitosamente',
        type: 'success',
        action: null,
      });
    } catch (err) {
      console.error('Error creating channel:', err);
      const errorMsg = err.detail?.[0]?.msg || err.message || 'Error al crear el canal';
      setModalState({
        isOpen: true,
        title: 'Error',
        message: errorMsg,
        type: 'error',
        action: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContextMenu = (e, channel) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      channelId: channel.id,
    });
  };

  const handleEditChannel = () => {
    const channel = channels.find((ch) => ch.id === contextMenu.channelId);
    if (channel) {
      setEditingChannel(channel);
      setShowEditModal(true);
    }
    closeContextMenu();
  };

  const handleDeleteChannel = () => {
    setModalState({
      isOpen: true,
      title: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar este canal? Esta acción no se puede deshacer.',
      type: 'warning',
      action: 'delete',
      channelId: contextMenu.channelId,
    });
    closeContextMenu();
  };

  const handleInviteMembers = () => {
    setShowInviteModal(true);
    closeContextMenu();
  };

  const confirmDeleteChannel = async () => {
    const { channelId } = modalState;
    setModalState((prev) => ({ ...prev, isOpen: false }));
    setLoading(true);
    try {
      await deleteChannel(channelId);
      removeChannel(channelId);
      setModalState({
        isOpen: true,
        title: 'Éxito',
        message: 'Canal eliminado exitosamente',
        type: 'success',
        action: null,
        channelId: null,
      });
    } catch (err) {
      console.error('Error deleting channel:', err);
      const errorMsg = err.detail?.[0]?.msg || err.message || 'Error al eliminar el canal';
      setModalState({
        isOpen: true,
        title: 'Error',
        message: errorMsg,
        type: 'error',
        action: null,
        channelId: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEditChannel = async (channelData) => {
    setLoading(true);
    try {
      await updateChannel(editingChannel.id, channelData);
      setShowEditModal(false);
      setModalState({
        isOpen: true,
        title: 'Éxito',
        message: 'Canal actualizado exitosamente',
        type: 'success',
        action: null,
        channelId: null,
      });
    } catch (err) {
      console.error('Error updating channel:', err);
      const errorMsg = err.detail?.[0]?.msg || err.message || 'Error al actualizar el canal';
      setModalState({
        isOpen: true,
        title: 'Error',
        message: errorMsg,
        type: 'error',
        action: null,
        channelId: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async (email) => {
    setLoading(true);
    try {
      const channel = channels.find((ch) => ch.id === contextMenu.channelId);
      await addChannelMember(channel.id, email);
      setShowInviteModal(false);
      setModalState({
        isOpen: true,
        title: 'Éxito',
        message: 'Invitación enviada exitosamente',
        type: 'success',
        action: null,
        channelId: null,
      });
    } catch (err) {
      console.error('Error sending invite:', err);
      const errorMsg = err.detail?.[0]?.msg || err.message || 'Error al enviar la invitación';
      setModalState({
        isOpen: true,
        title: 'Error',
        message: errorMsg,
        type: 'error',
        action: null,
        channelId: null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="servers-column">
      {/* Crear canal */}
      <button
        className="server-icon-btn"
        title="Crear canal"
        onClick={() => setShowCreateModal(true)}
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '2px dashed rgba(255, 255, 255, 0.3)',
          background: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'inherit',
          transition: 'all 0.2s',
          marginBottom: '8px',
          padding: '0',
          flexShrink: 0
        }}
      >
        <Plus size={24} strokeWidth={2} />
      </button>

      {/* Lista de canales como círculos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', alignItems: 'center', position: 'relative' }} onClick={closeContextMenu}>
        {channels.map((channel) => (
          <button
            key={channel.id}
            className={`server-icon ${selectedChannel?.id === channel.id ? 'active' : ''}`}
            onClick={() => handleSelectChannel(channel)}
            onContextMenu={(e) => handleContextMenu(e, channel)}
            title={channel.name}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: selectedChannel?.id === channel.id ? '#5865f2' : '#40444b',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '20px',
              fontWeight: '600',
              transition: 'all 0.2s',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => {
              if (selectedChannel?.id !== channel.id) {
                e.target.style.background = '#48525c';
                e.target.style.borderRadius = '30%';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedChannel?.id !== channel.id) {
                e.target.style.background = '#40444b';
                e.target.style.borderRadius = '50%';
              }
            }}
          >
            {channel.name?.charAt(0).toUpperCase()}
          </button>
        ))}

        {/* Context Menu */}
        {contextMenu.isOpen && (
          <div
            style={{
              position: 'fixed',
              top: `${contextMenu.y}px`,
              left: `${contextMenu.x}px`,
              background: isDark ? '#2c2f33' : '#fff',
              border: `1px solid ${isDark ? '#202225' : '#ccc'}`,
              borderRadius: '4px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              zIndex: 1000,
              minWidth: '150px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleEditChannel}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: 'none',
                background: 'transparent',
                color: isDark ? '#dbdee1' : '#2c2f33',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '14px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              Editar canal
            </button>
            <button
              onClick={handleInviteMembers}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: 'none',
                background: 'transparent',
                color: isDark ? '#dbdee1' : '#2c2f33',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '14px',
                borderTop: `1px solid ${isDark ? '#202225' : '#eee'}`,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              Invitar miembros
            </button>
            <button
              onClick={handleDeleteChannel}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: 'none',
                background: 'transparent',
                color: '#f04747',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '14px',
                borderTop: `1px solid ${isDark ? '#202225' : '#eee'}`,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = isDark ? 'rgba(240,71,71,0.1)' : 'rgba(240,71,71,0.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              Eliminar canal
            </button>
          </div>
        )}
      </div>
      {/* Modals */}
      <ChannelModal
        isOpen={showCreateModal}
        title="Crear canal"
        channelName=""
        onClose={() => setShowCreateModal(false)}
        onConfirm={handleCreateChannel}
        loading={loading}
      />

      <EditChannelModal
        isOpen={showEditModal}
        title="Editar canal"
        channel={editingChannel}
        onClose={() => setShowEditModal(false)}
        onConfirm={handleSaveEditChannel}
        loading={loading}
      />

      <InviteMemberModal
        isOpen={showInviteModal}
        title="Invitar miembro"
        onClose={() => setShowInviteModal(false)}
        onConfirm={handleSendInvite}
        loading={loading}
      />

      <Modal
        isOpen={modalState.isOpen && !modalState.action}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onConfirm={() => setModalState({ ...modalState, isOpen: false })}
        confirmText="OK"
        showCancel={false}
      />

      <Modal
        isOpen={modalState.isOpen && modalState.action === 'delete'}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onConfirm={confirmDeleteChannel}
        confirmText="Eliminar"
        cancelText="Cancelar"
        showCancel={true}
      />
    </div>
  );
};

export default ServerIcons;
