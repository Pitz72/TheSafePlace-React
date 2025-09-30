/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string
  readonly BASE_URL: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly VITE_LOG_LEVEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}