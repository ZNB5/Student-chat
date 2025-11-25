import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useChannels } from '../context/ChannelsContext';
import { Sun, Moon, MessageSquare, LogOut, User, Hash, Volume2 } from 'lucide-react';
import './dashboard.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { channels, loading: channelsLoading } = useChannels();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const textChannels = channels.filter(ch => ch.type === 'text' || !ch.type);
  const voiceChannels = channels.filter(ch => ch.type === 'voice');

  return (
    <div className={`dashboard-container ${isDark ? 'dark-theme' : 'light-theme'}`}>
      <div className="dashboard-header">
        <div className="dashboard-content">
          <h1 className="dashboard-title">Panel de Control</h1>
          <div className="header-buttons">
            <button className="btn btn-theme" onClick={toggleTheme} title="Cambiar tema">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="btn btn-discord" onClick={() => navigate('/chat')} title="Ir a Chat">
              <MessageSquare size={18} />
            </button>
            <button className="btn btn-logout" onClick={handleLogout}>
              <LogOut size={18} style={{ marginRight: '8px' }} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-main">
        <div className="container">
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h2 className="card-title"><User size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Perfil del Usuario</h2>
              <div className="card-content">
                <div className="profile-item">
                  <strong>ID:</strong>
                  <span>{user?.id}</span>
                </div>
                <div className="profile-item">
                  <strong>Email:</strong>
                  <span>{user?.email}</span>
                </div>
                <div className="profile-item">
                  <strong>Usuario:</strong>
                  <span>{user?.username}</span>
                </div>
                {user?.full_name && (
                  <div className="profile-item">
                    <strong>Nombre Completo:</strong>
                    <span>{user.full_name}</span>
                  </div>
                )}
                <div className="profile-item">
                  <strong>Estado:</strong>
                  <span className="status-badge">{user?.is_active ? '🟢 Activo' : '🔴 Inactivo'}</span>
                </div>
              </div>
            </div>

            <div className="dashboard-card">
              <h2 className="card-title">Estadísticas</h2>
              <div className="card-content stats">
                <div className="stat-item">
                  <span className="stat-label">Canales de Texto</span>
                  <span className="stat-value">{textChannels.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Canales de Voz</span>
                  <span className="stat-value">{voiceChannels.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total de Canales</span>
                  <span className="stat-value">{channels.length}</span>
                </div>
              </div>
            </div>

            <div className="dashboard-card full-width">
              <h2 className="card-title">Canales Disponibles</h2>
              <div className="channels-list">
                {channelsLoading ? (
                  <div className="loading">Cargando canales...</div>
                ) : channels.length === 0 ? (
                  <div className="empty">No hay canales disponibles</div>
                ) : (
                  <>
                    {textChannels.length > 0 && (
                      <div className="channel-section">
                        <h3 className="section-title">Canales de Texto</h3>
                        <div className="channel-items">
                          {textChannels.map(channel => (
                            <div key={channel.id} className="channel-item-display">
                              <Hash size={16} className="channel-icon" />
                              <span className="channel-name">{channel.name}</span>
                              <span className="channel-id">({channel.id.substring(0, 8)}...)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {voiceChannels.length > 0 && (
                      <div className="channel-section">
                        <h3 className="section-title">Canales de Voz</h3>
                        <div className="channel-items">
                          {voiceChannels.map(channel => (
                            <div key={channel.id} className="channel-item-display">
                              <Volume2 size={16} className="channel-icon" />
                              <span className="channel-name">{channel.name}</span>
                              <span className="channel-id">({channel.id.substring(0, 8)}...)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="dashboard-card full-width">
              <h2 className="card-title">Enlaces Rápidos</h2>
              <div className="quick-links">
                <button className="quick-link-btn" onClick={() => navigate('/chat')}>
                  <span className="link-icon"><MessageSquare size={24} /></span>
                  <span className="link-text">Ir a Chat</span>
                </button>
                <button className="quick-link-btn" onClick={toggleTheme}>
                  <span className="link-icon">{isDark ? <Sun size={24} /> : <Moon size={24} />}</span>
                  <span className="link-text">{isDark ? 'Modo Claro' : 'Modo Oscuro'}</span>
                </button>
                <button className="quick-link-btn" onClick={() => navigate('/dashboard')}>
                  <span className="link-icon"><User size={24} /></span>
                  <span className="link-text">Panel Principal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
