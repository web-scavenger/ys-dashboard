import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const widgets = sqliteTable('widgets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type').notNull(),
  position: integer('position').notNull(),
  // JSON-serialized, type-specific payload. Parsed + validated against the
  // matching schema in the repository (see widget.repository.sqlite.ts).
  data: text('data').notNull(),
});
