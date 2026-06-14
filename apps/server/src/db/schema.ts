import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const widgets = sqliteTable('widgets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type').notNull(),
  position: integer('position').notNull(),
  title: text('title').notNull(),
  // Epoch-ms timestamps; surfaced as ISO strings at the contract edge.
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
  // JSON-serialized, type-specific payload. Parsed + validated against the
  // matching schema in the repository (see widget.repository.sqlite.ts).
  data: text('data').notNull(),
});
