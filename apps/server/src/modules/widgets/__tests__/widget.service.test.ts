import { beforeEach, describe, expect, it } from 'vitest';
import type { ListWidgetsQuery, Widget } from '@ys/contracts';
import { NotFoundError, ValidationError } from '../../../common/errors.js';
import { WidgetManager } from '../entities/widget-manager.js';
import type {
  CreateWidgetInput,
  UpdateWidgetInput,
  WidgetRepository,
} from '../repositories/widget.repository.js';
import { WidgetService } from '../widget.service.js';

/** Minimal in-memory fake of the repository port — keeps the service test fast
 * and DB-free; the real query path is covered by the sqlite repository test. */
class FakeWidgetRepository implements WidgetRepository {
  private readonly store = new Map<number, Widget>();
  private nextId = 1;

  list(sort: ListWidgetsQuery): Promise<Widget[]> {
    const dir = sort.order === 'desc' ? -1 : 1;
    const sorted = [...this.store.values()].sort((a, b) => {
      const av = a[sort.sortBy];
      const bv = b[sort.sortBy];
      return av < bv ? -dir : av > bv ? dir : 0;
    });
    return Promise.resolve(sorted);
  }

  findById(id: number): Promise<Widget | undefined> {
    return Promise.resolve(this.store.get(id));
  }

  create(input: CreateWidgetInput): Promise<Widget> {
    const id = this.nextId++;
    const now = new Date().toISOString();
    const widget = {
      id,
      position: input.position,
      title: input.title,
      createdAt: now,
      updatedAt: now,
      type: input.type,
      data: input.data,
    } as Widget;
    this.store.set(id, widget);
    return Promise.resolve(widget);
  }

  update(id: number, patch: UpdateWidgetInput): Promise<Widget | undefined> {
    const existing = this.store.get(id);
    if (!existing) return Promise.resolve(undefined);
    const updated = {
      ...existing,
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.data !== undefined ? { data: patch.data } : {}),
    } as Widget;
    this.store.set(id, updated);
    return Promise.resolve(updated);
  }

  delete(id: number): Promise<boolean> {
    return Promise.resolve(this.store.delete(id));
  }

  maxPosition(): Promise<number | undefined> {
    if (this.store.size === 0) return Promise.resolve(undefined);
    return Promise.resolve(Math.max(...[...this.store.values()].map((w) => w.position)));
  }
}

const byPosition: ListWidgetsQuery = { sortBy: 'position', order: 'asc' };

describe('WidgetService', () => {
  let service: WidgetService;

  beforeEach(() => {
    service = new WidgetService(new FakeWidgetRepository(), new WidgetManager());
  });

  it('assigns sequential positions starting at 0', async () => {
    const first = await service.create({ type: 'text' });
    const second = await service.create({ type: 'line' });

    expect(first.position).toBe(0);
    expect(second.position).toBe(1);
  });

  it('creates each type with its initial data and a default title', async () => {
    const text = await service.create({ type: 'text' });
    const bar = await service.create({ type: 'bar' });

    expect(text).toMatchObject({ type: 'text', title: 'Text', data: { content: '' } });
    expect(bar.type).toBe('bar');
    expect(bar.title).toBe('Bar chart');
    expect(bar.data).toHaveProperty('points');
  });

  it('updates text content', async () => {
    const text = await service.create({ type: 'text' });

    const updated = await service.update(text.id, { content: 'hello' });

    expect(updated.data).toEqual({ content: 'hello' });
    await expect(service.list(byPosition)).resolves.toContainEqual(updated);
  });

  it('renames any widget, including a chart, via title-only update', async () => {
    const line = await service.create({ type: 'line' });

    const updated = await service.update(line.id, { title: 'Revenue' });

    expect(updated.title).toBe('Revenue');
    expect(updated.type).toBe('line');
  });

  it('rejects content updates to a chart widget', async () => {
    const line = await service.create({ type: 'line' });

    await expect(service.update(line.id, { content: 'x' })).rejects.toBeInstanceOf(ValidationError);
  });

  it('throws NotFoundError when updating a missing widget', async () => {
    await expect(service.update(999, { title: 'x' })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws NotFoundError when deleting a missing widget', async () => {
    await expect(service.delete(999)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('deletes an existing widget', async () => {
    const text = await service.create({ type: 'text' });

    await service.delete(text.id);

    await expect(service.list(byPosition)).resolves.toEqual([]);
  });
});
