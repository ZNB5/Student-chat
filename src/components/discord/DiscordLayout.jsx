import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useChannels } from '../../context/ChannelsContext';
import { Menu, X } from 'lucide-react';
import ServerIcons from './ServerIcons';
import ChannelList from './ChannelList';
import ChatList from './ChatList';
import ChatArea from './ChatArea';
import UserPanel from './UserPanel';
import './discord.css';

const DiscordLayout = () => {
  const { isDark } = useTheme();
  const { loading } = useChannels();
  const [showSidebar, setShowSidebar] = useState(false);

  if (loading) {
    return (
      <div className={`discord-layout ${isDark ? 'dark-theme' : 'light-theme'}`}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '18px', opacity: 0.7 }}>Cargando canales...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`discord-layout ${isDark ? 'dark-theme' : 'light-theme'}`}>
      {/* Columna 1: Canales en círculos */}
      <ServerIcons />

      {/* Columna 2: Lista de hilos */}
      <ChatList />

      {/* Columna 3: Chat del hilo */}
      <ChatArea />
    </div>
  );
};

export default DiscordLayout;
