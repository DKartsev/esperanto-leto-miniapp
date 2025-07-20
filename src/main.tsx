import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import AdminPanelPage from './pages/AdminPanelPage';
import './index.css';
import { SupabaseAuthProvider } from './components/SupabaseAuthProvider';
import { TelegramWebAppProvider } from './components/TelegramWebAppProvider';
import AuthCallback from './pages/AuthCallback';
import TelegramLoginRedirect from './components/TelegramLoginRedirect';

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <BrowserRouter>
      {/* SupabaseAuthProvider should wrap TelegramWebAppProvider so that */}
      {/* the Telegram provider can access authentication context */}
      <SupabaseAuthProvider>
        <TelegramWebAppProvider>
          <TelegramLoginRedirect />
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/admin-panel" element={<AdminPanelPage />} />
            <Route path="/*" element={<App />} />
          </Routes>
        </TelegramWebAppProvider>
      </SupabaseAuthProvider>
    </BrowserRouter>
  </StrictMode>
);

// Loading screen is hidden after the intro video ends
