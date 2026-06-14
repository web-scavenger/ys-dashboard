import type { InferInsertModel, InferSelectModel, SQL } from 'drizzle-orm';
import type { SQLiteColumn, SQLiteTable } from 'drizzle-orm/sqlite-core';
import type { Db } from './client.js';

export interface FindOptions {
  where?: SQL;
  orderBy?: SQL | SQLiteColumn;
  limit?: number;
}

/**
 * Thin, ORM-agnostic base over a single Drizzle table. All Drizzle query-builder
 * usage lives here so concrete repositories call `this.find()` / `this.insertOne()`
 * etc. instead of repeating `db.select().from(table)...` chains. Swapping the ORM
 * means rewriting this one file. better-sqlite3 is synchronous; results are wrapped
 * in `Promise.resolve` to satisfy the async repository interfaces.
 */
export abstract class BaseRepository<TTable extends SQLiteTable, TDomain> {
  constructor(
    protected readonly db: Db,
    protected readonly table: TTable,
  ) {}

  /** Map a raw row to the domain shape (e.g. JSON.parse + Zod validate). */
  protected abstract mapRow(row: InferSelectModel<TTable>): TDomain;

  protected find(options: FindOptions = {}): Promise<TDomain[]> {
    let query = this.db.select().from(this.table).$dynamic();
    if (options.where) {
      query = query.where(options.where);
    }
    if (options.orderBy) {
      query = query.orderBy(options.orderBy);
    }
    if (options.limit !== undefined) {
      query = query.limit(options.limit);
    }
    const rows = query.all() as InferSelectModel<TTable>[];
    return Promise.resolve(rows.map((row) => this.mapRow(row)));
  }

  protected async findOne(where: SQL): Promise<TDomain | undefined> {
    const [row] = await this.find({ where, limit: 1 });
    return row;
  }

  protected insertOne(values: InferInsertModel<TTable>): Promise<TDomain> {
    const row = this.db.insert(this.table).values(values).returning().get() as InferSelectModel<TTable>;
    return Promise.resolve(this.mapRow(row));
  }

  protected updateWhere(
    where: SQL,
    set: Partial<InferInsertModel<TTable>>,
  ): Promise<TDomain | undefined> {
    const row = this.db.update(this.table).set(set).where(where).returning().get() as
      | InferSelectModel<TTable>
      | undefined;
    return Promise.resolve(row ? this.mapRow(row) : undefined);
  }

  protected deleteWhere(where: SQL): Promise<boolean> {
    const result = this.db.delete(this.table).where(where).run();
    return Promise.resolve(result.changes > 0);
  }
}
