import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ChannelsProvider } from './context/ChannelsContext';
import { ThreadsProvider } from './context/ThreadsContext';
import { MessagesProvider } from './context/MessagesContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DiscordDashboardPage from './pages/DiscordDashboardPage';
import TestPage from './pages/TestPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ChannelsProvider>
            <ThreadsProvider>
              <MessagesProvider>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route
                    path="/chat"
                    element={
                      <ProtectedRoute>
                        <DiscordDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/tests" element={
                    <ProtectedRoute>
                      <TestPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/" element={<Navigate to="/chat" replace />} />
                </Routes>
              </MessagesProvider>
            </ThreadsProvider>
          </ChannelsProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
