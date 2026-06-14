import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDb, runMigrations, type DbHandle } from '../../../db/client.js';
import { SqliteWidgetRepository } from '../repositories/widget.repository.sqlite.js';

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
      data: { content: 'hi' },
    });

    expect(created).toMatchObject({
      id: expect.any(Number),
      type: 'text',
      data: { content: 'hi' },
    });
    await expect(repository.findById(created.id)).resolves.toEqual(created);
    await expect(repository.maxPosition()).resolves.toBe(0);
  });

  it('lists widgets ordered by position', async () => {
    await repository.create({ type: 'text', position: 1, data: { content: 'b' } });
    await repository.create({ type: 'line', position: 0, data: { points: [] } });

    const list = await repository.list();

    expect(list.map((w) => w.position)).toEqual([0, 1]);
  });

  it('updates data and deletes', async () => {
    const created = await repository.create({
      type: 'text',
      position: 0,
      data: { content: 'a' },
    });

    const updated = await repository.updateData(created.id, { content: 'z' });
    expect(updated?.data).toEqual({ content: 'z' });

    await expect(repository.delete(created.id)).resolves.toBe(true);
    await expect(repository.delete(created.id)).resolves.toBe(false);
    await expect(repository.findById(created.id)).resolves.toBeUndefined();
  });
});
