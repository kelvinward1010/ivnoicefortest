import { useRouter } from "@tanstack/react-router"
import { useMemo } from "react"

const useCurrentUrl = () => {
  const router = useRouter()
  const { pathname } = router.state.location

  return useMemo(() => {
    return `${window.location.origin}${pathname}`
  }, [pathname])
}

export default useCurrentUrl
