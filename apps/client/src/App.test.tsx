import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.js';

function renderApp() {
  // A fresh client per test with retries off, so error states resolve fast and
  // tests don't share cache.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
}

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
  renderApp();

  expect(screen.getByRole('heading', { name: 'Hello World' })).toBeInTheDocument();
  expect(await screen.findByText('Server says: Hello world')).toBeInTheDocument();
});
