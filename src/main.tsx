import { Provider } from "@/components/ui/provider"
import { t } from "i18next"
import ReactDOM from "react-dom/client"
import "./index.css"
import "./i18n"
import { routeTree } from "@/routeTree.gen"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import axios from "axios"
import { StrictMode } from "react"
import { OpenAPI } from "./client"

OpenAPI.BASE = import.meta.env.VITE_API_URL
OpenAPI.WITH_CREDENTIALS = true
OpenAPI.TOKEN = async () => {
  return localStorage.getItem("access_token") || ""
}

const queryClient = new QueryClient()
// const LOGIN_URL = `${import.meta.env.VITE_LOGIN_CORE_ADMIN_URL}/login`

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status
      if (status === 404) {
        alert(t("frontend.src.main.Unauthorized"))
        window.location.href = "http://192.168.80.48:4201/login"
      } else if (status === 403) {
        alert(t("frontend.src.main.Forbidden"))
        window.location.href = "http://192.168.80.48:4201/login"
      }
    }
    return Promise.reject(error)
  },
)

const router = createRouter({ routeTree })
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
      <Provider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </Provider>
  </StrictMode>,
)
