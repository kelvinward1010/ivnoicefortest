interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_NOTIFICATION_HOST: string
  readonly VITE_SOCKET_HOST: string
  readonly VITE_LOGIN_CORE_ADMIN_URL: string
  readonly VITE_FOLDER_CMS_ID: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
