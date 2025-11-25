import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useChannels } from '../../context/ChannelsContext';
import { useThreads } from '../../context/ThreadsContext';
import { useWikipedia } from '../../hooks/useWikipedia'; // Import useWikipedia hook
import { useProgrammingBot } from '../../hooks/useProgrammingBot'; // Import useProgrammingBot hook
import { useCode } from '../../hooks/useCode'; // Import useCode hook
import { Hash, MessageSquare, Search, Pin, MoreVertical, Send, Upload, Trash2, Edit2, Users, FileText, Zap } from 'lucide-react';
import { createMessage, getMessages, deleteMessage, updateMessage } from '../../api/messagesApi';
import { uploadFile, getMessageFiles, deleteFile } from '../../api/filesApi';
import apiService from '../../api/apiService';

const ChatArea = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { selectedChannel } = useChannels();
  const { selectedThread } = useThreads();
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [showPresenceModal, setShowPresenceModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [presenceData, setPresenceData] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteUUID, setInviteUUID] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');

  // Initialize bot hooks
  const { sendMessage: wikipediaSendMessage } = useWikipedia();
  const { sendMessage: programmingBotSendMessage } = useProgrammingBot();
  const { sendMessage: codeSendMessage } = useCode();

  useEffect(() => {
    if (selectedThread?.id) {
      loadMessages();
    }
  }, [selectedThread?.id, user?.id]); // Added user.id as a dependency

  const loadMessages = async () => {
    setLoading(true);
    try {
      // Use UUID for API calls to messages service
      const threadId = selectedThread._uuidId || selectedThread.id;
      const data = await getMessages(threadId, 50);
      // API returns 'items' not 'messages'
      const msgList = data.items || data.messages || [];

      // Normalize messages to ensure they have all required fields
      const normalizedMessages = msgList.map(msg => ({
        id: msg.id || msg._id || msg.message_id,
        content: msg.content || msg.text || msg.body || '',
        author: msg.user_id || msg.author || msg.username || msg.user || 'Usuario',
        created_by: msg.user_id || msg.created_by || msg.author,
        created_at: msg.created_at || msg.timestamp || msg.created,
        user_id: msg.user_id || msg.created_by || msg.author
      }));

      setMessages(normalizedMessages);
    } catch (err) {
      console.error('Error loading messages:', err);
      if (err?.response?.data) {
        console.error('Error response:', err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedThread) return;
    console.log('Sending message with user.id:', user?.id, 'thread.id:', selectedThread?.id);
    setLoading(true);
    let messageHandled = false;

    // Check for Wikipedia command
    if (inputValue.startsWith('/wikipedia ')) {
      const query = inputValue.substring('/wikipedia '.length);
      try {
        const response = await wikipediaSendMessage(query);
        if (response) {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: `bot-wiki-${Date.now()}`,
              content: `${response.response || response.message || 'No information found.'}`,
              author: 'Wikipedia Bot',
              created_by: 'Wikipedia Bot',
              created_at: new Date().toISOString(),
            },
          ]);
        }
        messageHandled = true;
      } catch (err) {
        console.error('Error with Wikipedia command:', err);
        setMessages((prevMessages) => [
          ...prevMessages,
                      {
                        id: `bot-wiki-error-${Date.now()}`,
                        content: `Could not retrieve information. The service may be down or the command is incorrect.`,
                        author: 'Wikipedia Bot',
                        created_by: 'Wikipedia Bot',
                        created_at: new Date().toISOString(),
                        isError: true,
                      },        ]);
        messageHandled = true;
      }
    } else if (inputValue.startsWith('/programing ')) {
      const code = inputValue.substring('/programing '.length);
      try {
        const response = await programmingBotSendMessage(code);
        if (response) {
          setMessages((prevMessages) => [
            ...prevMessages,
                      {
                        id: `bot-prog-${Date.now()}`,
                        content: `${response.response || response.message || 'No solution found.'}`,
                        author: 'Programming Bot',
                        created_by: 'Programming Bot',
                        created_at: new Date().toISOString(),
                      },          ]);
        }
        messageHandled = true;
      } catch (err) {
        console.error('Error with Programming command:', err);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: `bot-prog-error-${Date.now()}`,
            content: `Could not process your request. The service may be down or the command is incorrect.`,
            author: 'Programming Bot',
            created_by: 'Programming Bot',
            created_at: new Date().toISOString(),
            isError: true,
          },
        ]);
        messageHandled = true;
      }
    } else if (inputValue.startsWith('/code ')) {
      const query = inputValue.substring('/code '.length);
      try {
        const response = await codeSendMessage(query);
        if (response) {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: `bot-code-${Date.now()}`,
              content: `${response.reply || response.message || 'No solution found.'}`,
              author: 'Code Bot',
              created_by: 'Code Bot',
              created_at: new Date().toISOString(),
            },
          ]);
        }
        messageHandled = true;
      } catch (err) {
        console.error('Error with Code command:', err);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: `bot-code-error-${Date.now()}`,
            content: `Could not retrieve code documentation. The service may be down or the command is incorrect.`,
            author: 'Code Bot',
            created_by: 'Code Bot',
            created_at: new Date().toISOString(),
            isError: true,
          },
        ]);
        messageHandled = true;
      }
    }

    if (messageHandled) {
      setInputValue('');
      setLoading(false);
      return;
    }

    // Existing logic for regular messages
    try {
      const threadId = selectedThread._uuidId || selectedThread.id;
      const newMessage = await createMessage(threadId, user.id, inputValue);
      setMessages([...messages, newMessage]);
      setInputValue('');
    } catch (err) {
      console.error('Error sending message:', err);
      if (err?.detail) {
        console.error('Detail:', err.detail);
        console.error('Detail[0]:', err.detail[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    setLoading(true);
    try {
      const threadId = selectedThread._uuidId || selectedThread.id;
      await deleteMessage(threadId, messageId, user.id);
      setMessages(messages.filter((msg) => msg.id !== messageId));
    } catch (err) {
      console.error('Error deleting message:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMessage = async (messageId) => {
    if (!editingContent.trim()) return;
    setLoading(true);
    try {
      const threadId = selectedThread._uuidId || selectedThread.id;
      const updated = await updateMessage(threadId, messageId, user.id, editingContent);
      setMessages(messages.map((msg) => (msg.id === messageId ? updated : msg)));
      setEditingMessageId(null);
      setEditingContent('');
    } catch (err) {
      console.error('Error editing message:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedThread || messages.length === 0) return;

    setLoading(true);
    try {
      const threadId = selectedThread._uuidId || selectedThread.id;
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.id) {
        await uploadFile(threadId, lastMessage.id, file);
        await loadMessages();
      }
    } catch (err) {
      console.error('Error uploading file:', err);
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePresenceClick = async () => {
    setLoading(true);
    try {
      // Get presence statistics
      const statsResponse = await apiService.presence.getStats();
      const stats = statsResponse.data || {};

      // Get list of online users
      const usersResponse = await apiService.presence.list({ status: 'online' });
      const onlineUsers = usersResponse.data || [];
      const onlineList = Array.isArray(onlineUsers) ? onlineUsers : onlineUsers.users || [];

      let content = `👥 **Estado de Presencia del Sistema**\n\n`;

      if (stats.online !== undefined && stats.offline !== undefined) {
        content += `**Estadísticas Generales:**\n`;
        content += `• En línea: ${stats.online}\n`;
        content += `• Fuera de línea: ${stats.offline}\n\n`;
      }

      if (onlineList.length > 0) {
        content += `**Usuarios En Línea (${onlineList.length}):**\n`;
        onlineList.forEach((user, idx) => {
          const device = user.device ? ` [${user.device}]` : '';
          const lastSeen = user.last_seen ? new Date(user.last_seen).toLocaleTimeString('es-ES') : 'N/A';
          content += `${idx + 1}. ${user.userId || 'Usuario'}${device} - Último acceso: ${lastSeen}\n`;
        });
      } else {
        content += `No hay usuarios en línea en este momento.`;
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: `bot-presence-${Date.now()}`,
          content: content,
          author: 'Sistema',
          created_by: 'Sistema',
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error('Error with Presence:', err);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: `bot-presence-error-${Date.now()}`,
          content: `⚠️ No se pudieron obtener las estadísticas de presencia.`,
          author: 'Sistema',
          created_by: 'Sistema',
          created_at: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = async () => {
    setLoading(true);
    try {
      let content = `🔍 **Panel de Búsqueda Global**\n\n`;
      content += `Busca en:\n`;
      content += `• **Mensajes** - Contenido, autor, tipo\n`;
      content += `• **Archivos** - Documentos, adjuntos, multimedia\n`;
      content += `• **Hilos** - Por autor, fecha, keyword, estado\n`;
      content += `• **Canales** - Por nombre, propietario, tipo\n\n`;
      content += `**Para realizar búsquedas específicas, usa los comandos:**\n`;
      content += `• \`/search:messages mi término\` - Busca en mensajes\n`;
      content += `• \`/search:files documento\` - Busca archivos\n`;
      content += `• \`/search:threads tema\` - Busca hilos\n`;
      content += `• \`/search:channels equipo\` - Busca canales\n`;

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: `bot-search-${Date.now()}`,
          content: content,
          author: 'Sistema',
          created_by: 'Sistema',
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error('Error with Search:', err);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: `bot-search-error-${Date.now()}`,
          content: `⚠️ No se pudo cargar el panel de búsqueda.`,
          author: 'Sistema',
          created_by: 'Sistema',
          created_at: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilesClick = async () => {
    setLoading(true);
    try {
      const response = await apiService.files.list({});
      const files = response.data || [];
      const filesList = Array.isArray(files) ? files : files.files || [];

      let content = `📁 **Gestión de Archivos**\n\n`;

      if (filesList.length > 0) {
        content += `**Total de Archivos:** ${filesList.length}\n\n`;
        content += `**Archivos Disponibles:**\n`;
        filesList.slice(0, 10).forEach((file, idx) => {
          const name = file.name || file.filename || 'archivo';
          const size = file.size ? ` (${(file.size / 1024).toFixed(2)} KB)` : '';
          const mimeType = file.mime_type ? ` [${file.mime_type}]` : '';
          content += `${idx + 1}. ${name}${size}${mimeType}\n`;
        });
        if (filesList.length > 10) {
          content += `\n... y ${filesList.length - 10} archivos más`;
        }
      } else {
        content += `No hay archivos en el servidor.`;
      }

      content += `\n\n**Funciones disponibles:**\n`;
      content += `• Buscar archivos por nombre\n`;
      content += `• Ver metadatos (tamaño, tipo MIME, checksum)\n`;
      content += `• Auditar integridad de archivos`;

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: `bot-files-${Date.now()}`,
          content: content,
          author: 'Sistema',
          created_by: 'Sistema',
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error('Error with Files:', err);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: `bot-files-error-${Date.now()}`,
          content: `⚠️ No se pudo obtener la lista de archivos.`,
          author: 'Sistema',
          created_by: 'Sistema',
          created_at: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePresenceModalClick = async () => {
    setLoading(true);
    try {
      // Get presence info for current user
      if (user?.id) {
        const presenceResponse = await apiService.presence.get(user.id);
        const presence = presenceResponse.data || {};

        // Get members of the channel using /v1/members/
        let members = [];
        if (selectedChannel?.id) {
          try {
            // Fetch members from the channel
            const membersResponse = await apiService.channels.getMembers(selectedChannel.id);
            members = membersResponse.data || [];
            if (!Array.isArray(members)) {
              members = members.users || members.members || [];
            }
          } catch (err) {
            console.error('Error fetching members:', err);
            // Fallback: try to get from channel data
            try {
              const channelResponse = await apiService.channels.get(selectedChannel.id);
              const channelData = channelResponse.data || {};
              members = channelData.users || channelData.members || channelData.participants || [];
            } catch (e) {
              console.error('Error fetching channel data:', e);
            }
          }
        }

        setPresenceData({
          userId: user.id,
          device: presence.device || 'unknown',
          status: presence.status || 'online',
          lastSeen: presence.last_seen,
          participants: members,
        });
        setShowPresenceModal(true);
      }
    } catch (err) {
      console.error('Error loading presence modal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchThreadsClick = async (keyword) => {
    setLoading(true);
    try {
      const response = await apiService.search.threadsById(keyword);
      const threads = response.data || [];
      setSearchResults(Array.isArray(threads) ? threads : [threads]);
      setShowSearchModal(true);
    } catch (err) {
      console.error('Error searching threads:', err);
      setSearchResults([]);
      setShowSearchModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByKeyword = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await apiService.search.threadsById(searchQuery);
      const threads = response.data || [];
      setSearchResults(Array.isArray(threads) ? threads : [threads]);
    } catch (err) {
      console.error('Error searching threads:', err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteUUID.trim()) return;
    if (!selectedChannel?.id) {
      setInviteMessage('❌ Selecciona un canal primero');
      return;
    }

    // Validate UUID format (simple validation)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(inviteUUID.trim())) {
      setInviteMessage('❌ UUID inválido. Formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
      return;
    }

    setInviteLoading(true);
    setInviteMessage('');

    try {
      // Send invitation to add member with UUID
      await apiService.channels.addMember(selectedChannel.id, inviteUUID.trim());
      setInviteMessage('✅ Miembro invitado correctamente');
      setInviteUUID('');

      // Reload presence data to show new member
      setTimeout(() => {
        handlePresenceModalClick();
      }, 1000);
    } catch (err) {
      console.error('Error inviting member:', err);
      setInviteMessage(`❌ Error al invitar: ${err.response?.data?.detail || err.message}`);
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <div className={`chat-area ${isDark ? 'dark' : 'light'}`}>
      <div className="chat-header">
        <div className="channel-info">
          {selectedThread ? (
            <>
              <MessageSquare size={20} className="channel-icon" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <h3 style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>
                  {selectedChannel?.name || 'Canal'}
                </h3>
                <h3 style={{ margin: 0 }}>{selectedThread.title}</h3>
              </div>
            </>
          ) : (
            <>
              <MessageSquare size={20} className="channel-icon" />
              <h3>Selecciona un hilo para chatear</h3>
            </>
          )}
        </div>
        <div className="header-actions">
          <button className="icon-btn" title="Usuarios Conectados" onClick={handlePresenceModalClick}>
            <Users size={18} />
          </button>
          <button className="icon-btn" title="Buscar Hilos" onClick={handleSearchClick}>
            <Search size={18} />
          </button>
          <button className="icon-btn" title="Archivos" onClick={handleFilesClick}>
            <FileText size={18} />
          </button>
          <button className="icon-btn" title="Más">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <div className="messages-container">
        {!selectedThread ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.6 }}>
            <div style={{ textAlign: 'center' }}>
              <MessageSquare size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>Selecciona un hilo para comenzar a chatear</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="message"
              style={{
                padding: '12px 16px',
                borderRadius: '4px',
                marginBottom: '8px',
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                display: 'flex',
                gap: '12px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)';
              }}
            >
              <div
                className="message-avatar"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#5865f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: '600',
                  flexShrink: 0,
                }}
              >
                {(msg.author || 'Usuario')?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="message-content" style={{ flex: 1 }}>
                <div
                  className="message-header"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px',
                  }}
                >
                  <span
                    className="message-author"
                    style={{
                      fontWeight: '600',
                      color: isDark ? '#dbdee1' : '#2c2f33',
                    }}
                  >
                    {msg.author || 'Usuario'}
                  </span>
                  <span
                    className="message-timestamp"
                    style={{
                      fontSize: '12px',
                      color: isDark ? '#72767d' : '#999',
                    }}
                  >
                    {msg.created_at ? new Date(msg.created_at).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    }) : 'Ahora'}
                  </span>
                </div>
                {editingMessageId === msg.id ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '4px',
                        border: `1px solid ${isDark ? '#404249' : '#ccc'}`,
                        backgroundColor: isDark ? '#36393f' : '#fff',
                        color: isDark ? '#dbdee1' : '#2c2f33',
                        fontFamily: 'inherit',
                      }}
                    />
                    <button
                      onClick={() => handleEditMessage(msg.id)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#5865f2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Guardar
                    </button>
                  </div>
                ) : (
                  <div
                    className="message-text"
                    style={{
                      color: isDark ? '#dbdee1' : '#2c2f33',
                      wordBreak: 'break-word',
                    }}
                  >
                    {msg.content}
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '4px',
                    opacity: 0.7,
                  }}
                >
                  {msg.created_by === user?.id && (
                    <>
                      <button
                        onClick={() => {
                          setEditingMessageId(msg.id);
                          setEditingContent(msg.content);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: isDark ? '#72767d' : '#999',
                          padding: '4px',
                        }}
                        title="Editar"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#f04747',
                          padding: '4px',
                        }}
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="message-input-container" style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
        <input
          type="file"
          id="file-upload"
          onChange={handleUploadFile}
          style={{ display: 'none' }}
          disabled={!selectedThread || loading}
        />
        <button
          onClick={() => document.getElementById('file-upload').click()}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: isDark ? '#b5bac1' : '#72767d',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          disabled={!selectedThread || loading}
          title="Adjuntar archivo"
        >
          <Upload size={20} />
        </button>
        <textarea
          className="message-input"
          placeholder={
            selectedThread
              ? `Mensaje en ${selectedThread.title}`
              : selectedChannel
              ? `Mensaje en #${selectedChannel.name}`
              : 'Selecciona un hilo'
          }
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          rows="1"
          disabled={!selectedThread || loading}
          style={{
            flex: 1,
          }}
        />
        <button
          className="send-btn"
          onClick={handleSendMessage}
          disabled={!selectedThread || loading}
          title="Enviar"
          style={{
            background: '#5865f2',
            border: 'none',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Send size={18} />
        </button>
      </div>

      {/* Modal de Presencia */}
      {showPresenceModal && presenceData && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowPresenceModal(false)}
        >
          <div
            style={{
              backgroundColor: isDark ? '#36393f' : '#ffffff',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '500px',
              maxHeight: '80vh',
              overflowY: 'auto',
              color: isDark ? '#dbdee1' : '#2c2f33',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 16px 0' }}>👥 Usuarios Conectados</h2>

            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${isDark ? '#404249' : '#e0e0e0'}` }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Mi Información</h3>
              <p style={{ margin: '4px 0', fontSize: '13px' }}>
                <strong>Usuario:</strong> {presenceData.userId}
              </p>
              <p style={{ margin: '4px 0', fontSize: '13px' }}>
                <strong>Device:</strong> {presenceData.device}
              </p>
              <p style={{ margin: '4px 0', fontSize: '13px' }}>
                <strong>Estado:</strong> {presenceData.status}
              </p>
            </div>

            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${isDark ? '#404249' : '#e0e0e0'}` }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>
                Participantes del Canal ({presenceData.participants.length})
              </h3>
              {presenceData.participants.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {presenceData.participants.map((participant, idx) => {
                    const participantId = participant.id || participant.user_id || participant.member_id || 'N/A';
                    const participantName = participant.name || participant.username || participant.email || participantId;
                    return (
                      <div
                        key={idx}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: isDark ? '#404249' : '#f0f0f0',
                          borderRadius: '4px',
                          fontSize: '12px',
                        }}
                      >
                        <div style={{ marginBottom: '4px' }}>
                          <strong>{participantName}</strong>
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.7 }}>
                          ID: {participantId}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ fontSize: '12px', opacity: 0.7 }}>No hay participantes</p>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>👤 Invitar Miembro</h3>
              <form onSubmit={handleInviteMember} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="UUID del usuario (ej: 2eb511a1-5f38-41a7-8e75-3f4e65f4942e)"
                  value={inviteUUID}
                  onChange={(e) => setInviteUUID(e.target.value)}
                  disabled={inviteLoading}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '4px',
                    border: `1px solid ${isDark ? '#404249' : '#ccc'}`,
                    backgroundColor: isDark ? '#2c2f33' : '#fff',
                    color: isDark ? '#dbdee1' : '#2c2f33',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <button
                  type="submit"
                  disabled={inviteLoading || !inviteUUID.trim()}
                  style={{
                    padding: '10px',
                    backgroundColor: inviteLoading ? '#6c757d' : '#5865f2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: inviteLoading ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                  }}
                >
                  {inviteLoading ? 'Invitando...' : 'Invitar'}
                </button>
                {inviteMessage && (
                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: inviteMessage.includes('✅') ? '#1e7e34' : '#d32f2f',
                      color: '#fff',
                      textAlign: 'center',
                    }}
                  >
                    {inviteMessage}
                  </div>
                )}
              </form>
            </div>

            <button
              onClick={() => {
                setShowPresenceModal(false);
                setInviteMessage('');
              }}
              style={{
                marginTop: '8px',
                width: '100%',
                padding: '10px',
                backgroundColor: '#5865f2',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Búsqueda de Hilos */}
      {showSearchModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowSearchModal(false)}
        >
          <div
            style={{
              backgroundColor: isDark ? '#36393f' : '#ffffff',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '500px',
              maxHeight: '80vh',
              overflowY: 'auto',
              color: isDark ? '#dbdee1' : '#2c2f33',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 16px 0' }}>🔍 Buscar Hilos</h2>

            <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Buscar por palabra clave..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchByKeyword()}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: `1px solid ${isDark ? '#404249' : '#ccc'}`,
                  backgroundColor: isDark ? '#2c2f33' : '#fff',
                  color: isDark ? '#dbdee1' : '#2c2f33',
                }}
              />
              <button
                onClick={handleSearchByKeyword}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#5865f2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Buscar
              </button>
            </div>

            {searchResults.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {searchResults.map((thread, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px',
                      backgroundColor: isDark ? '#404249' : '#f0f0f0',
                      borderRadius: '4px',
                    }}
                  >
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '13px' }}>
                      {thread.title || thread.name || 'Hilo sin título'}
                    </h4>
                    <p style={{ margin: '0', fontSize: '11px', opacity: 0.7 }}>
                      ID: {thread.id || 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '12px', opacity: 0.7 }}>
                {searchQuery ? 'No se encontraron resultados' : 'Ingresa una palabra clave para buscar'}
              </p>
            )}

            <button
              onClick={() => setShowSearchModal(false)}
              style={{
                marginTop: '16px',
                width: '100%',
                padding: '10px',
                backgroundColor: '#5865f2',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatArea;
