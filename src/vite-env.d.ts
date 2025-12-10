/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STACKS_NETWORK: string
  readonly VITE_STACKS_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
