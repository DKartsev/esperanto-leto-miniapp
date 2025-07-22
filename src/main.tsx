import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import AdminPanelPage from './pages/AdminPanelPage';
import './index.css';
import { SupabaseAuthProvider } from './components/SupabaseAuthProvider';
import { TelegramWebAppProvider } from './components/TelegramWebAppProvider';
import TelegramLoginRedirect from './components/TelegramLoginRedirect';
import { UserProvider } from './context/UserContext';

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <BrowserRouter>
      {/* SupabaseAuthProvider should wrap TelegramWebAppProvider so that */}
      {/* the Telegram provider can access authentication context */}
      <SupabaseAuthProvider>
        <TelegramWebAppProvider>
          <UserProvider>
            <TelegramLoginRedirect />
            <Routes>
              <Route path="/admin-panel" element={<AdminPanelPage />} />
              <Route path="/*" element={<App />} />
            </Routes>
          </UserProvider>
        </TelegramWebAppProvider>
      </SupabaseAuthProvider>
    </BrowserRouter>
  </StrictMode>
);

// Loading screen is hidden after the intro video ends
