import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useChannels } from '../../context/ChannelsContext';
import { listPresences } from '../../api/presenceApi';
import { Sun, Moon, LogOut } from 'lucide-react';

const UserPanel = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { selectedChannel } = useChannels();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!selectedChannel) {
        setMembers([]);
        return;
      }

      setLoading(true);
      try {
        const presenceList = await listPresences();
        if (Array.isArray(presenceList)) {
          setMembers(presenceList);
        }
      } catch (err) {
        console.error('Error fetching members:', err);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [selectedChannel]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return '#43b581';
      case 'idle':
        return '#faa61a';
      case 'dnd':
        return '#f04747';
      case 'offline':
        return '#747f8d';
      default:
        return '#747f8d';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'online':
        return 'En línea';
      case 'idle':
        return 'Inactivo';
      case 'dnd':
        return 'No molestar';
      case 'offline':
        return 'Desconectado';
      default:
        return status;
    }
  };

  const truncateId = (id) => {
    if (!id) return 'N/A';
    return id.length > 8 ? `${id.substring(0, 8)}...` : id;
  };

  return (
    <div className={`user-panel ${isDark ? 'dark' : 'light'}`}>
      <div className="panel-header">
        <h3>Miembros</h3>
        <div className="panel-actions">
          <button className="action-btn" title="Tema" onClick={toggleTheme}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="action-btn" title="Cerrar sesión" onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="members-list">
        {!selectedChannel ? (
          <div className="no-channel">Selecciona un canal</div>
        ) : loading ? (
          <div className="loading">Cargando...</div>
        ) : members.length === 0 ? (
          <div className="no-members">No hay miembros</div>
        ) : (
          members.map((member) => (
            <div
              key={member.user_id || member.id}
              className="member-card"
              style={{ borderLeft: `4px solid ${getStatusColor(member.status)}` }}
            >
              <div className="member-content">
                <div className="member-id">{truncateId(member.user_id || member.id)}</div>
                <div className="member-status">{getStatusLabel(member.status)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserPanel;
