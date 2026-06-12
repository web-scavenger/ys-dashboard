import { describe, expect, it } from 'vitest';
import { InMemoryHelloRepository } from '../repositories/hello.repository.memory.js';
import { HelloService } from '../hello.service.js';

describe('HelloService', () => {
  it('wraps the repository greeting in a HelloResponse', async () => {
    const service = new HelloService(new InMemoryHelloRepository());

    await expect(service.getHello()).resolves.toEqual({ message: 'Hello world' });
  });
});
