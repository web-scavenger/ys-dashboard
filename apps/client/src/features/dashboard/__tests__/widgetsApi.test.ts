import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api';
import { createWidget, deleteWidget } from '../api/widgetsApi.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('widgetsApi', () => {
  it('parses a created widget against the contract', async () => {
    const widget = {
      id: 1,
      position: 0,
      title: 'Text',
      createdAt: '2026-06-14T00:00:00.000Z',
      updatedAt: '2026-06-14T00:00:00.000Z',
      type: 'text',
      data: { content: '' },
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: true, status: 201, json: () => Promise.resolve(widget) })),
    );

    await expect(createWidget({ type: 'text' })).resolves.toEqual(widget);
  });

  it('resolves deleteWidget on a 204 with no body', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({ ok: true, status: 204, json: () => Promise.reject() }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(deleteWidget(1)).resolves.toBeUndefined();

    // A bodyless DELETE must not declare a JSON content-type — Fastify rejects an
    // empty body when one is set, which previously broke delete.
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/widgets/1'),
      expect.not.objectContaining({ headers: { 'content-type': 'application/json' } }),
    );
  });

  it('throws ApiError with the server message when delete fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ statusCode: 404, error: 'Not Found', message: 'missing' }),
        }),
      ),
    );

    await expect(deleteWidget(1)).rejects.toMatchObject({
      constructor: ApiError,
      statusCode: 404,
      message: 'missing',
    });
  });
});
