import { helloResponseSchema } from '@ys/contracts';
import { request } from '@/lib/api';
import type { HelloMessage } from '../types.js';

export function getHello(): Promise<HelloMessage> {
  return request('/api/hello', helloResponseSchema);
}
