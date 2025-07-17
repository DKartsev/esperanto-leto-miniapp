import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { SupabaseAuthProvider } from './components/SupabaseAuthProvider';
import AuthCallback from './pages/AuthCallback';

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
      <SupabaseAuthProvider>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/*" element={<App />} />
        </Routes>
      </SupabaseAuthProvider>
    </BrowserRouter>
  </StrictMode>
);

// Hide loading screen after React renders
window.setTimeout(hideLoadingScreen, 100);
