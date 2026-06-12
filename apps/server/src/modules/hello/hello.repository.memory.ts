import type { HelloRepository } from './hello.repository.js';

/**
 * In-memory implementation of {@link HelloRepository}. Placeholder storage for
 * the config pass; the real persistence layer (SQLite / JSON) lands with the
 * widgets feature and slots in behind the same interface.
 */
export class InMemoryHelloRepository implements HelloRepository {
  private readonly greeting = 'Hello world';

  getGreeting(): Promise<string> {
    return Promise.resolve(this.greeting);
  }
}
