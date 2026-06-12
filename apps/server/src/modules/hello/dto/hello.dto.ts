// Module-local DTOs. The shared API schema lives in @ys/contracts (single source
// of truth) and is re-exported here so routes import it from the module's dto/.
export { helloResponseSchema } from '@ys/contracts';
export type { HelloResponse } from '@ys/contracts';
