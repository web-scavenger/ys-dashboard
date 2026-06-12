/**
 * Repository port for the hello module. The service depends on this interface,
 * never on a concrete implementation, so storage can be swapped (in-memory now;
 * better-sqlite3 / JSON file later) by binding a different class in the
 * composition root. This is the same seam the widgets repository will follow.
 */
export interface HelloRepository {
  getGreeting(): Promise<string>;
}
