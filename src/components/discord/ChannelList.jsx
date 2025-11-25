import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useChannels } from '../../context/ChannelsContext';
import { useAuth } from '../../context/AuthContext';
import { createChannel, updateChannel, deleteChannel, addChannelMember, removeChannelMember, getChannelMembers } from '../../api/channelsApi';
import { Hash, Plus, Edit2 } from 'lucide-react';
import Modal from '../Modal';
import ChannelModal from '../ChannelModal';

const ChannelList = () => {
  const { isDark } = useTheme();
  const { channels, selectedChannel, selectChannel, addChannel, updateChannelInList, removeChannel } = useChannels();
  const { user } = useAuth();
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [editingChannelId, setEditingChannelId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [channelMembers, setChannelMembers] = useState({});
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    action: null,
    channelId: null
  });

  React.useEffect(() => {
    const loadMembers = async () => {
      if (editingChannelId && !channelMembers[editingChannelId]) {
        try {
          const members = await getChannelMembers(editingChannelId);
          setChannelMembers(prev => ({
            ...prev,
            [editingChannelId]: Array.isArray(members) ? members : []
          }));
        } catch (err) {
          console.error('Error loading members:', err);
          setChannelMembers(prev => ({
            ...prev,
            [editingChannelId]: []
          }));
        }
      }
    };
    loadMembers();
  }, [editingChannelId]);

  const handleCreateChannel = async (channelName) => {
    setLoading(true);
    try {
      const newChannel = await createChannel({
        name: channelName,
        description: '',
        owner_id: user.id
      });
      addChannel(newChannel);
      setShowCreateChannelModal(false);
      setModalState({
        isOpen: true,
        title: 'Éxito',
        message: 'Canal creado exitosamente',
        type: 'success',
        action: null,
        channelId: null
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
        channelId: null
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditChannel = async (channelId, channelName) => {
    setLoading(true);
    try {
      const updated = await updateChannel(channelId, { name: channelName });
      updateChannelInList(channelId, updated);
      setEditingChannelId(null);
      setModalState({
        isOpen: true,
        title: 'Éxito',
        message: 'Canal actualizado exitosamente',
        type: 'success',
        action: null,
        channelId: null
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
        channelId: null
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChannel = async (channelId) => {
    setModalState({
      isOpen: true,
      title: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar este canal? Esta acción no se puede deshacer.',
      type: 'warning',
      action: 'delete',
      channelId: channelId
    });
  };

  const confirmDeleteChannel = async () => {
    const { channelId } = modalState;
    setModalState(prev => ({ ...prev, isOpen: false }));
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
        channelId: null
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
        channelId: null
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMemberFromModal = async (userId) => {
    if (!userId.trim() || !editingChannelId) return;
    setLoading(true);
    try {
      await addChannelMember(editingChannelId, userId);
      setModalState({
        isOpen: true,
        title: 'Éxito',
        message: 'Miembro agregado exitosamente',
        type: 'success',
        action: null,
        channelId: null
      });
    } catch (err) {
      console.error('Error adding member:', err);
      const errorMsg = err.detail?.[0]?.msg || err.message || 'Error al agregar miembro';
      setModalState({
        isOpen: true,
        title: 'Error',
        message: errorMsg,
        type: 'error',
        action: null,
        channelId: null
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMemberFromModal = async (userId) => {
    if (!editingChannelId) return;
    setLoading(true);
    try {
      await removeChannelMember(editingChannelId, userId);
      setModalState({
        isOpen: true,
        title: 'Éxito',
        message: 'Miembro removido exitosamente',
        type: 'success',
        action: null,
        channelId: null
      });
    } catch (err) {
      console.error('Error removing member:', err);
      const errorMsg = err.detail?.[0]?.msg || err.message || 'Error al remover miembro';
      setModalState({
        isOpen: true,
        title: 'Error',
        message: errorMsg,
        type: 'error',
        action: null,
        channelId: null
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`channel-list ${isDark ? 'dark' : 'light'}`} style={{ position: 'relative' }}>
      <div className="server-header">
        <h2>Canales</h2>
        <button
          className="menu-btn"
          onClick={() => setShowCreateChannelModal(true)}
          title="Crear canal"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="channels-container" style={{ position: 'relative' }}>
        {channels.length === 0 ? (
          <div style={{ padding: '16px', opacity: 0.6, fontSize: '14px', textAlign: 'center' }}>
            No hay canales disponibles
          </div>
        ) : (
          <div className="channels">
            {channels.map((channel, index) => (
              <div key={`channel-${channel.id}-${index}`}>
                <div
                  className={`channel-item ${selectedChannel?.id === channel.id ? 'active' : ''}`}
                  onClick={() => selectChannel(channel)}
                >
                  <Hash size={16} className="channel-icon" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                    <span className="channel-name">{channel.name}</span>
                    {channel.owner_id === user.id && (
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          background: '#7289da',
                          color: 'white',
                          borderRadius: '3px',
                          whiteSpace: 'nowrap'
                        }}
                        title="Eres el propietario de este canal"
                      >
                        OWNER
                      </span>
                    )}
                  </div>
                  <div className="channel-actions">
                    {channel.owner_id === user.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingChannelId(channel.id);
                        }}
                        title="Editar canal"
                        disabled={loading}
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ChannelModal
        isOpen={showCreateChannelModal}
        title="Crear canal"
        channelName=""
        onClose={() => setShowCreateChannelModal(false)}
        onConfirm={handleCreateChannel}
        loading={loading}
      />

      <ChannelModal
        isOpen={editingChannelId !== null}
        title="Editar canal"
        channelName={channels.find(ch => ch.id === editingChannelId)?.name || ''}
        members={channelMembers[editingChannelId] || []}
        onClose={() => setEditingChannelId(null)}
        onConfirm={(name) => handleEditChannel(editingChannelId, name)}
        onDelete={() => handleDeleteChannel(editingChannelId)}
        onAddMember={handleAddMemberFromModal}
        onRemoveMember={handleRemoveMemberFromModal}
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

export default ChannelList;
