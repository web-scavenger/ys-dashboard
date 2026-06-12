import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const greetings = sqliteTable('greetings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  message: text('message').notNull(),
});
