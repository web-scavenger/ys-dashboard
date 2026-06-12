import type { HelloRepository } from './hello.repository.js';

/** In-memory implementation, used by unit tests and as a no-DB fallback. */
export class InMemoryHelloRepository implements HelloRepository {
  private readonly greeting = 'Hello world';

  getGreeting(): Promise<string> {
    return Promise.resolve(this.greeting);
  }
}
