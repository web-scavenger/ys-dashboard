import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDb, runMigrations, type DbHandle } from '../../../db/client.js';
import { SqliteHelloRepository } from '../repositories/hello.repository.sqlite.js';

describe('SqliteHelloRepository', () => {
  let handle: DbHandle;

  beforeEach(() => {
    handle = createDb(':memory:');
    runMigrations(handle.db);
  });

  afterEach(() => {
    handle.close();
  });

  it('reads the seeded greeting from the database', async () => {
    const repository = new SqliteHelloRepository(handle.db);

    await expect(repository.getGreeting()).resolves.toBe('Hello world');
  });
});
