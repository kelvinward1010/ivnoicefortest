import { useNavigate } from "@tanstack/react-router"

const isLoggedIn = () => {
  return localStorage.getItem("access_token") !== null
}

const useAuth = () => {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem("access_token")
    navigate({ to: "/login" })
  }

  return {
    logout,
  }
}

export { isLoggedIn }
export default useAuth
