import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useThreads } from '../../context/ThreadsContext';
import { useChannels } from '../../context/ChannelsContext';
import {
  createThread,
  updateThread,
  deleteThread,
  archiveThread,
} from '../../api/threadsApi';
import { MessageSquare, Plus, Edit2, Trash2, Archive, Moon, Sun, LogOut } from 'lucide-react';
import ChatModal from '../ChatModal';
import Modal from '../Modal';
import './ChatList.css';

const ChatList = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { selectedChannel } = useChannels();
  const {
    threads,
    selectedThread,
    selectThread,
    fetchThreads,
    addThread,
    updateThreadInList,
    removeThread,
  } = useThreads();

  const [showCreateThreadModal, setShowCreateThreadModal] = useState(false);
  const [editingThreadId, setEditingThreadId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    action: null,
    threadId: null,
  });

  // Allow any user to create threads in a channel
  const canCreateThreads = !!selectedChannel && !!user;

  // Load threads when channel changes
  useEffect(() => {
    if (selectedChannel?.id) {
      fetchThreads(selectedChannel.id);
    }
  }, [selectedChannel?.id]);

  const handleCreateThread = async (threadTitle) => {
    if (!selectedChannel) return;
    setLoading(true);
    try {
      const newThread = await createThread({
        channel_id: selectedChannel.id,
        title: threadTitle,
        created_by: user.id,
        meta: {},
      });
      addThread(newThread);
      // Refresh threads list to ensure it's up to date
      fetchThreads(selectedChannel.id);
      setShowCreateThreadModal(false);
      setModalState({
        isOpen: true,
        title: 'Éxito',
        message: 'Hilo creado exitosamente',
        type: 'success',
        action: null,
        threadId: null,
      });
    } catch (err) {
      console.error('Error creating thread:', err);
      const errorMsg = err.detail?.[0]?.msg || err.message || 'Error al crear el hilo';
      setModalState({
        isOpen: true,
        title: 'Error',
        message: errorMsg,
        type: 'error',
        action: null,
        threadId: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditThread = async (threadId, threadTitle) => {
    setLoading(true);
    try {
      const updated = await updateThread(threadId, { title: threadTitle });
      updateThreadInList(threadId, updated);
      setEditingThreadId(null);
      setModalState({
        isOpen: true,
        title: 'Éxito',
        message: 'Hilo actualizado exitosamente',
        type: 'success',
        action: null,
        threadId: null,
      });
    } catch (err) {
      console.error('Error updating thread:', err);
      const errorMsg = err.detail?.[0]?.msg || err.message || 'Error al actualizar el hilo';
      setModalState({
        isOpen: true,
        title: 'Error',
        message: errorMsg,
        type: 'error',
        action: null,
        threadId: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteThread = (threadId) => {
    setModalState({
      isOpen: true,
      title: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar este hilo? Esta acción no se puede deshacer.',
      type: 'warning',
      action: 'delete',
      threadId: threadId,
    });
  };

  const confirmDeleteThread = async () => {
    const { threadId } = modalState;
    setModalState((prev) => ({ ...prev, isOpen: false }));
    setLoading(true);
    try {
      await deleteThread(threadId);
      removeThread(threadId);
      // Refresh threads list to ensure it's up to date
      if (selectedChannel?.id) {
        fetchThreads(selectedChannel.id);
      }
      setModalState({
        isOpen: true,
        title: 'Éxito',
        message: 'Hilo eliminado exitosamente',
        type: 'success',
        action: null,
        threadId: null,
      });
    } catch (err) {
      console.error('Error deleting thread:', err);
      const errorMsg = err.detail?.[0]?.msg || err.message || 'Error al eliminar el hilo';
      setModalState({
        isOpen: true,
        title: 'Error',
        message: errorMsg,
        type: 'error',
        action: null,
        threadId: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveThread = async (threadId) => {
    setLoading(true);
    try {
      const archived = await archiveThread(threadId);
      updateThreadInList(threadId, archived);
      setModalState({
        isOpen: true,
        title: 'Éxito',
        message: 'Hilo archivado exitosamente',
        type: 'success',
        action: null,
        threadId: null,
      });
    } catch (err) {
      console.error('Error archiving thread:', err);
      const errorMsg = err.detail?.[0]?.msg || err.message || 'Error al archivar el hilo';
      setModalState({
        isOpen: true,
        title: 'Error',
        message: errorMsg,
        type: 'error',
        action: null,
        threadId: null,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!selectedChannel) {
    return (
      <div className={`thread-list ${isDark ? 'dark' : 'light'}`}>
        <div className="thread-list-empty">
          <MessageSquare size={32} opacity={0.5} />
          <p>Selecciona un canal para ver sus hilos</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`thread-list ${isDark ? 'dark' : 'light'}`}>
      <div className="thread-header">
        <h3>Hilos</h3>
        {canCreateThreads && (
          <button
            className="create-thread-btn"
            onClick={() => setShowCreateThreadModal(true)}
            title="Crear hilo"
            disabled={loading}
          >
            <Plus size={18} />
          </button>
        )}
      </div>

      <div className="thread-list-container">
        {threads.length === 0 ? (
          <div className="thread-list-empty">
            <MessageSquare size={24} opacity={0.5} />
            <p>
              {canCreateThreads
                ? 'No hay hilos. ¡Crea uno para comenzar!'
                : 'No hay hilos en este canal'}
            </p>
          </div>
        ) : (
          <div className="threads">
            {threads.map((thread) => (
              <div
                key={thread.id}
                className={`thread-item ${selectedThread?.id === thread.id ? 'active' : ''}`}
                onClick={() => selectThread(thread)}
              >
                <div className="thread-content">
                  <MessageSquare size={16} className="thread-icon" />
                  <div className="thread-info">
                    <span className="thread-title">{thread.title}</span>
                    {thread.status && (
                      <span className="thread-status">{thread.status}</span>
                    )}
                  </div>
                </div>

                {canCreateThreads && (
                  <div className="thread-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingThreadId(thread.id);
                      }}
                      title="Editar hilo"
                      disabled={loading}
                      className="action-btn"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteThread(thread.id);
                      }}
                      title="Eliminar hilo"
                      disabled={loading}
                      className="action-btn delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="thread-footer">
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={isDark ? 'Modo claro' : 'Modo oscuro'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          className="logout-btn"
          onClick={() => logout()}
          title="Cerrar sesión"
        >
          <LogOut size={18} />
        </button>
      </div>

      <ChatModal
        isOpen={showCreateThreadModal}
        title="Crear nuevo chat"
        threadTitle=""
        onClose={() => setShowCreateThreadModal(false)}
        onConfirm={handleCreateThread}
        loading={loading}
      />

      <ChatModal
        isOpen={editingThreadId !== null}
        title="Editar chat"
        threadTitle={threads.find((th) => th.id === editingThreadId)?.title || ''}
        onClose={() => setEditingThreadId(null)}
        onConfirm={(title) => handleEditThread(editingThreadId, title)}
        onDelete={() => handleDeleteThread(editingThreadId)}
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
        onConfirm={confirmDeleteThread}
        confirmText="Eliminar"
        cancelText="Cancelar"
        showCancel={true}
      />
    </div>
  );
};

export default ChatList;
