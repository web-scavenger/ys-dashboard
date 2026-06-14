import { desc, eq } from 'drizzle-orm';
import { widgetSchema, type Widget, type WidgetData } from '@ys/contracts';
import { BaseRepository } from '../../../db/base-repository.js';
import type { Db } from '../../../db/client.js';
import { widgets } from '../../../db/schema.js';
import type { WidgetRow } from '../entities/widget-row.js';
import type { CreateWidgetInput, WidgetRepository } from './widget.repository.js';

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

  list(): Promise<Widget[]> {
    return this.find({ orderBy: widgets.position });
  }

  findById(id: number): Promise<Widget | undefined> {
    return this.findOne(eq(widgets.id, id));
  }

  create(input: CreateWidgetInput): Promise<Widget> {
    return this.insertOne({
      type: input.type,
      position: input.position,
      data: JSON.stringify(input.data),
    });
  }

  updateData(id: number, data: WidgetData): Promise<Widget | undefined> {
    return this.updateWhere(eq(widgets.id, id), { data: JSON.stringify(data) });
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
      type: row.type,
      data: JSON.parse(row.data) as unknown,
    });
  }
}
