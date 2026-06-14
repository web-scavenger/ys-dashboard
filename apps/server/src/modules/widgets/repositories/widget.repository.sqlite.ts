import { asc, desc, eq, sql, type SQL } from 'drizzle-orm';
import type { SQLiteColumn } from 'drizzle-orm/sqlite-core';
import {
  widgetSchema,
  type ListWidgetsQuery,
  type Widget,
  type WidgetSortField,
} from '@ys/contracts';
import { BaseRepository } from '../../../db/base-repository.js';
import type { Db } from '../../../db/client.js';
import { widgets } from '../../../db/schema.js';
import type { WidgetRow } from '../entities/widget-row.js';
import type {
  CreateWidgetInput,
  UpdateWidgetInput,
  WidgetRepository,
} from './widget.repository.js';

/** Maps a sortable field to the expression it orders by, so ordering dispatches
 * by lookup rather than a `switch`. The exhaustive `Record` fails to compile if
 * a sort field is added to the contract without a target here. `title` collates
 * case-insensitively so user-facing alphabetical order isn't split by case. */
const SORT_TARGETS: Record<WidgetSortField, SQL | SQLiteColumn> = {
  createdAt: widgets.createdAt,
  title: sql`${widgets.title} collate nocase`,
  position: widgets.position,
};

/** Drizzle-backed implementation built on {@link BaseRepository}. Drizzle stays
 * inside the repository — the service depends only on {@link WidgetRepository}.
 * The `data` column is stored as JSON text and validated by `type` via the
 * discriminated union on read. */
export class SqliteWidgetRepository
  extends BaseRepository<typeof widgets, Widget>
  implements WidgetRepository
{
  constructor(db: Db) {
    super(db, widgets);
  }

  list(sort: ListWidgetsQuery): Promise<Widget[]> {
    const direction = sort.order === 'desc' ? desc : asc;
    // `id` is a stable tiebreaker so equal sort values (e.g. same-ms createdAt,
    // duplicate titles) never order arbitrarily.
    return this.find({ orderBy: [direction(SORT_TARGETS[sort.sortBy]), direction(widgets.id)] });
  }

  findById(id: number): Promise<Widget | undefined> {
    return this.findOne(eq(widgets.id, id));
  }

  create(input: CreateWidgetInput): Promise<Widget> {
    return this.insertOne({
      type: input.type,
      position: input.position,
      title: input.title,
      data: JSON.stringify(input.data),
    });
  }

  update(id: number, patch: UpdateWidgetInput): Promise<Widget | undefined> {
    return this.updateWhere(eq(widgets.id, id), {
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.data !== undefined ? { data: JSON.stringify(patch.data) } : {}),
    });
  }

  delete(id: number): Promise<boolean> {
    return this.deleteWhere(eq(widgets.id, id));
  }

  async maxPosition(): Promise<number | undefined> {
    const [top] = await this.find({ orderBy: desc(widgets.position), limit: 1 });
    return top?.position;
  }

  /** Rebuild the domain widget from a row: parse the JSON payload, then validate
   * the whole shape through the union so a corrupt row throws here. */
  protected mapRow(row: WidgetRow): Widget {
    return widgetSchema.parse({
      id: row.id,
      position: row.position,
      title: row.title,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      type: row.type,
      data: JSON.parse(row.data) as unknown,
    });
  }
}
