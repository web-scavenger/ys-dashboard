import { describe, expect, it } from 'vitest';
import type { HelloRepository } from '../src/modules/hello/hello.repository.js';
import { HelloService } from '../src/modules/hello/hello.service.js';

describe('HelloService', () => {
  it('wraps the repository greeting in a HelloResponse', async () => {
    // A fake repository — the seam the layered design buys us: the service can
    // be tested without any HTTP server or real storage.
    const fakeRepo: HelloRepository = {
      getGreeting: () => Promise.resolve('Hi there'),
    };
    const service = new HelloService(fakeRepo);

    await expect(service.getHello()).resolves.toEqual({ message: 'Hi there' });
  });
});
