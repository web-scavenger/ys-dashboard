import { buildApp } from './app.js';

const app = await buildApp();

try {
  await app.listen({ host: app.config.HOST, port: app.config.PORT });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
