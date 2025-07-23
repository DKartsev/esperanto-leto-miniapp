import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

beforeEach(() => {
  localStorage.setItem('intro_seen', '1');
});

test('renders navigation labels', () => {
  render(<App />);
  expect(screen.getAllByText(/Главная/i)[0]).toBeInTheDocument();
  expect(screen.getAllByText(/Тест/i)[0]).toBeInTheDocument();
});

test('renders AI page after tab click', async () => {
  render(<App />);
  await userEvent.click(screen.getByText(/AI/i));
  expect(screen.getByText(/AI Помощник/i)).toBeInTheDocument();
});
