import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SupabaseAuthProvider } from '../components/SupabaseAuthProvider';
import App from '../App';

const queryClient = new QueryClient();

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <SupabaseAuthProvider>{children}</SupabaseAuthProvider>
  </QueryClientProvider>
);

beforeEach(() => {
  localStorage.setItem('intro_seen', '1');
});

test('renders navigation labels', () => {
  render(<App />, { wrapper: Wrapper });
  expect(screen.getAllByText(/Главная/i)[0]).toBeInTheDocument();
  expect(screen.getAllByText(/Тест/i)[0]).toBeInTheDocument();
});

test('renders AI page after tab click', async () => {
  render(<App />, { wrapper: Wrapper });
  await userEvent.click(screen.getByText(/AI/i));
  expect(screen.getByText(/AI Помощник/i)).toBeInTheDocument();
});
