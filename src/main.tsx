import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
import { SupabaseAuthProvider } from './components/SupabaseAuthProvider';
import { TelegramWebAppProvider } from './components/TelegramWebAppProvider';
import TelegramLoginRedirect from './components/TelegramLoginRedirect';
import { UserProvider } from './context/UserContext';

const queryClient = new QueryClient();

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SupabaseAuthProvider>
        <TelegramWebAppProvider>
          <UserProvider>
            <TelegramLoginRedirect />
            <App />
          </UserProvider>
        </TelegramWebAppProvider>
      </SupabaseAuthProvider>
    </QueryClientProvider>
  </StrictMode>
);

// Loading screen is hidden after the intro video ends
