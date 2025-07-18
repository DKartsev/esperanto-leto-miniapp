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

// Hide loading screen when React app mounts
function hideLoadingScreen() {
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    loadingElement.classList.add('hidden');
    window.setTimeout(() => {
      loadingElement.style.display = 'none';
    }, 300);
  }
}

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <BrowserRouter>
      <TelegramWebAppProvider>
        <SupabaseAuthProvider>
          <TelegramLoginRedirect />
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/admin-panel" element={<AdminPanelPage />} />
            <Route path="/*" element={<App />} />
          </Routes>
        </SupabaseAuthProvider>
      </TelegramWebAppProvider>
    </BrowserRouter>
  </StrictMode>
);

// Hide loading screen after React renders
window.setTimeout(hideLoadingScreen, 100);
