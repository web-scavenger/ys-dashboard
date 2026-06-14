import type { widgets } from '../../../db/schema.js';

/** Persistence shape of a widget row, inferred from the Drizzle schema. */
export type WidgetRow = typeof widgets.$inferSelect;
