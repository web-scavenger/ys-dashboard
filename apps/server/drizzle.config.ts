import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { config as loadDotenv } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Match the runtime (app.ts): load the server .env so `db:migrate` honors a
// DATABASE_PATH configured there instead of always hitting ./data/app.db.
loadDotenv({ quiet: true });

const url = process.env.DATABASE_PATH ?? './data/app.db';

// drizzle-kit (unlike the runtime client) won't create the DB's parent dir, so
// `db:migrate` against a fresh checkout would fail without this.
if (url !== ':memory:') {
  mkdirSync(dirname(url), { recursive: true });
}

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url },
});
