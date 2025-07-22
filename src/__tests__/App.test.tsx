import { render, screen } from '@testing-library/react';
import App from '../App';
import { MemoryRouter } from 'react-router-dom';

beforeEach(() => {
  localStorage.setItem('intro_seen', '1');
});

test('renders navigation labels', () => {
  render(<MemoryRouter initialEntries={['/ai']}><App /></MemoryRouter>);
  expect(screen.getAllByText(/Главная/i)[0]).toBeInTheDocument();
  expect(screen.getAllByText(/Тест/i)[0]).toBeInTheDocument();
});

test('renders AI page when routed', () => {
  render(<MemoryRouter initialEntries={['/ai']}><App /></MemoryRouter>);
  expect(screen.getAllByText(/AI/i)[0]).toBeInTheDocument();
});
