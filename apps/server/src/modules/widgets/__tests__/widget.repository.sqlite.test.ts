import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ListWidgetsQuery } from '@ys/contracts';
import { createDb, runMigrations, type DbHandle } from '../../../db/client.js';
import { SqliteWidgetRepository } from '../repositories/widget.repository.sqlite.js';

const order = (
  sortBy: ListWidgetsQuery['sortBy'],
  dir: ListWidgetsQuery['order'],
): ListWidgetsQuery => ({
  sortBy,
  order: dir,
});

describe('SqliteWidgetRepository', () => {
  let handle: DbHandle;
  let repository: SqliteWidgetRepository;

  beforeEach(() => {
    handle = createDb(':memory:');
    runMigrations(handle.db);
    repository = new SqliteWidgetRepository(handle.db);
  });

  afterEach(() => {
    handle.close();
  });

  it('returns undefined maxPosition when empty', async () => {
    await expect(repository.maxPosition()).resolves.toBeUndefined();
  });

  it('round-trips a widget through JSON storage', async () => {
    const created = await repository.create({
      type: 'text',
      position: 0,
      title: 'Notes',
      data: { content: 'hi' },
    });

    expect(created).toMatchObject({
      id: expect.any(Number),
      type: 'text',
      title: 'Notes',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      data: { content: 'hi' },
    });
    await expect(repository.findById(created.id)).resolves.toEqual(created);
    await expect(repository.maxPosition()).resolves.toBe(0);
  });

  it('orders by the requested field and direction', async () => {
    await repository.create({ type: 'text', position: 1, title: 'Bravo', data: { content: 'b' } });
    await repository.create({ type: 'line', position: 0, title: 'Alpha', data: { points: [] } });

    await expect(
      repository.list(order('position', 'asc')).then((w) => w.map((x) => x.position)),
    ).resolves.toEqual([0, 1]);
    await expect(
      repository.list(order('position', 'desc')).then((w) => w.map((x) => x.position)),
    ).resolves.toEqual([1, 0]);
    await expect(
      repository.list(order('title', 'asc')).then((w) => w.map((x) => x.title)),
    ).resolves.toEqual(['Alpha', 'Bravo']);
    await expect(
      repository.list(order('title', 'desc')).then((w) => w.map((x) => x.title)),
    ).resolves.toEqual(['Bravo', 'Alpha']);
  });

  it('updates title and data, then deletes', async () => {
    const created = await repository.create({
      type: 'text',
      position: 0,
      title: 'Old',
      data: { content: 'a' },
    });

    const updated = await repository.update(created.id, { title: 'New', data: { content: 'z' } });
    expect(updated?.title).toBe('New');
    expect(updated?.data).toEqual({ content: 'z' });

    await expect(repository.delete(created.id)).resolves.toBe(true);
    await expect(repository.delete(created.id)).resolves.toBe(false);
    await expect(repository.findById(created.id)).resolves.toBeUndefined();
  });
});
