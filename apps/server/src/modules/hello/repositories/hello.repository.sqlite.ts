import type { Db } from '../../../db/client.js';
import { greetings } from '../../../db/schema.js';
import type { Greeting } from '../entities/greeting.entity.js';
import type { HelloRepository } from './hello.repository.js';

/** Drizzle-backed implementation. Drizzle stays inside the repository — services
 * depend only on {@link HelloRepository}. */
export class SqliteHelloRepository implements HelloRepository {
  constructor(private readonly db: Db) {}

  getGreeting(): Promise<string> {
    const row: Greeting | undefined = this.db.select().from(greetings).limit(1).get();
    return Promise.resolve(row?.message ?? 'Hello world');
  }
}
