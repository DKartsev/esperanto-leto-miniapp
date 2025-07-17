import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SupabaseAuthProvider } from './components/SupabaseAuthProvider';
import AuthCallback from './components/AuthCallback';

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
const isAuthCallback = window.location.pathname === '/auth/callback';

root.render(
  <StrictMode>
    <SupabaseAuthProvider>
      {isAuthCallback ? <AuthCallback /> : <App />}
    </SupabaseAuthProvider>
  </StrictMode>
);

// Hide loading screen after React renders
window.setTimeout(hideLoadingScreen, 100);
