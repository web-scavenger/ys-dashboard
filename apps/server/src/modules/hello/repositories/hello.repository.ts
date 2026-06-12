/**
 * Repository port for the hello module. The service depends on this interface,
 * never on a concrete implementation, so the storage backend can be swapped by
 * binding a different class in the module.
 */
export interface HelloRepository {
  getGreeting(): Promise<string>;
}
