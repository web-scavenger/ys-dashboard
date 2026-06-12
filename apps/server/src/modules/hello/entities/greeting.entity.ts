import type { greetings } from '../../../db/schema.js';

/** Persistence shape of a greeting row, inferred from the Drizzle schema. */
export type Greeting = typeof greetings.$inferSelect;
