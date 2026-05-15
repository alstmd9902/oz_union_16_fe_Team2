/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
declare module 'swiper/css'

/* eslint-disable @typescript-eslint/consistent-type-definitions */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_ENABLE_MSW?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
