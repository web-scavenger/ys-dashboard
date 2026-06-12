import type { HelloResponse } from '@ys/contracts';
import type { HelloRepository } from './repositories/hello.repository.js';

/**
 * Business-logic layer for the hello module. Depends only on the repository
 * port; holds no knowledge of HTTP (that lives in the controller). Kept trivial
 * for the config pass — it's here to prove the controller -> service ->
 * repository wiring end to end.
 */
export class HelloService {
  constructor(private readonly repository: HelloRepository) {}

  async getHello(): Promise<HelloResponse> {
    const message = await this.repository.getGreeting();
    return { message };
  }
}
