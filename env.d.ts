/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_MOCKS?: string
  readonly VITE_SMSPILOT_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
