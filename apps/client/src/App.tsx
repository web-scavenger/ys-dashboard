import { useEffect, useState } from 'react';
import type { HelloResponse } from '@ys/types';

// Fall back to the server's default dev port so a fresh checkout works without a
// local .env (Vite does not load .env.example).
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

type FetchState =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; message: string };

export default function App() {
  const [state, setState] = useState<FetchState>({ status: 'loading' });

  useEffect(() => {
    let active = true;

    fetch(`${API_URL}/api/hello`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        return (await res.json()) as HelloResponse;
      })
      .then((data) => {
        if (active) {
          setState({ status: 'success', message: data.message });
        }
      })
      .catch((err: unknown) => {
        if (active) {
          const error = err instanceof Error ? err.message : 'Unknown error';
          setState({ status: 'error', error });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Hello World</h1>
      <p>
        Server URL: <code>{API_URL}</code>
      </p>
      {state.status === 'loading' && <p>Loading message from server…</p>}
      {state.status === 'error' && <p role="alert">Error: {state.error}</p>}
      {state.status === 'success' && <p>Server says: {state.message}</p>}
    </main>
  );
}
