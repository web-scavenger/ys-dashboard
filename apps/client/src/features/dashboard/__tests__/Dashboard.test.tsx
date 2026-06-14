import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { Dashboard } from '../components/Dashboard.js';
import { renderWithClient, textWidget } from './test-utils.js';

function stubWidgetsFetch(widgets: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(widgets) })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Dashboard', () => {
  it('shows the skeleton while loading', () => {
    stubWidgetsFetch([]);
    renderWithClient(<Dashboard />);
    expect(screen.getByLabelText('Loading widgets')).toBeInTheDocument();
  });

  it('shows the empty state when there are no widgets', async () => {
    stubWidgetsFetch([]);
    renderWithClient(<Dashboard />);
    expect(await screen.findByText('No widgets yet')).toBeInTheDocument();
  });

  it('renders the widget grid when widgets exist', async () => {
    stubWidgetsFetch([textWidget]);
    renderWithClient(<Dashboard />);
    expect(await screen.findByText('hello')).toBeInTheDocument();
  });
});

describe('Dashboard error state', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ statusCode: 500, error: 'Internal', message: 'boom' }),
        }),
      ),
    );
  });

  it('shows an error alert when the request fails', async () => {
    renderWithClient(<Dashboard />);
    expect(await screen.findByRole('alert')).toHaveTextContent('boom');
  });
});
