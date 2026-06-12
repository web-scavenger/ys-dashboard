import { render, screen } from '@testing-library/react';
import App from './App.js';

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ message: 'Hello world' }),
      }),
    ),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

it('renders the heading and the message fetched from the server', async () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: 'Hello World' })).toBeInTheDocument();
  expect(await screen.findByText('Server says: Hello world')).toBeInTheDocument();
});
