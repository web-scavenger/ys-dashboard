import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../../app.js';

describe('widgets routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('starts empty', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/widgets' });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });

  it('rejects an unknown type with 400', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/widgets',
      payload: { type: 'pie' },
    });

    expect(res.statusCode).toBe(400);
  });

  it('rejects an unknown sort field with 400', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/widgets?sortBy=bogus' });

    expect(res.statusCode).toBe(400);
  });

  it('creates with a default title and exposes timestamps', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/api/widgets',
      payload: { type: 'text' },
    });
    const widget = created.json<{
      id: number;
      title: string;
      createdAt: string;
      updatedAt: string;
    }>();
    expect(widget.title).toBe('Text');
    expect(Number.isNaN(Date.parse(widget.createdAt))).toBe(false);
    expect(Number.isNaN(Date.parse(widget.updatedAt))).toBe(false);

    await app.inject({ method: 'DELETE', url: `/api/widgets/${widget.id}` });
  });

  it('renames a widget via PATCH title', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/api/widgets',
      payload: { type: 'line' },
    });
    const widget = created.json<{ id: number }>();

    const res = await app.inject({
      method: 'PATCH',
      url: `/api/widgets/${widget.id}`,
      payload: { title: 'Revenue' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ title: 'Revenue' });

    await app.inject({ method: 'DELETE', url: `/api/widgets/${widget.id}` });
  });

  it('orders results by title when requested', async () => {
    const a = (
      await app.inject({ method: 'POST', url: '/api/widgets', payload: { type: 'text' } })
    ).json<{ id: number }>();
    const b = (
      await app.inject({ method: 'POST', url: '/api/widgets', payload: { type: 'line' } })
    ).json<{ id: number }>();
    await app.inject({ method: 'PATCH', url: `/api/widgets/${a.id}`, payload: { title: 'Zulu' } });
    await app.inject({ method: 'PATCH', url: `/api/widgets/${b.id}`, payload: { title: 'Alpha' } });

    const res = await app.inject({ method: 'GET', url: '/api/widgets?sortBy=title&order=asc' });
    const titles = res.json<{ title: string }[]>().map((w) => w.title);
    expect(titles).toEqual([...titles].sort());

    await app.inject({ method: 'DELETE', url: `/api/widgets/${a.id}` });
    await app.inject({ method: 'DELETE', url: `/api/widgets/${b.id}` });
  });

  it('creates, updates, lists and deletes a text widget', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/api/widgets',
      payload: { type: 'text' },
    });
    expect(created.statusCode).toBe(201);
    const widget = created.json<{ id: number; type: string; data: { content: string } }>();
    expect(widget).toMatchObject({ type: 'text', data: { content: '' } });

    const updated = await app.inject({
      method: 'PATCH',
      url: `/api/widgets/${widget.id}`,
      payload: { content: 'edited' },
    });
    expect(updated.statusCode).toBe(200);
    expect(updated.json()).toMatchObject({ data: { content: 'edited' } });

    const deleted = await app.inject({ method: 'DELETE', url: `/api/widgets/${widget.id}` });
    expect(deleted.statusCode).toBe(204);
  });

  it('returns 404 when updating a missing widget', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/widgets/9999',
      payload: { content: 'x' },
    });

    expect(res.statusCode).toBe(404);
  });

  it('returns 400 when updating a chart widget', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/api/widgets',
      payload: { type: 'line' },
    });
    const widget = created.json<{ id: number }>();

    const res = await app.inject({
      method: 'PATCH',
      url: `/api/widgets/${widget.id}`,
      payload: { content: 'x' },
    });

    expect(res.statusCode).toBe(400);
  });

  it('returns 404 when deleting a missing widget', async () => {
    const res = await app.inject({ method: 'DELETE', url: '/api/widgets/9999' });

    expect(res.statusCode).toBe(404);
  });
});
