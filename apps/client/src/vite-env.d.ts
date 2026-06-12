/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Optional: absent on a fresh checkout with no local .env (App.tsx falls back).
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
