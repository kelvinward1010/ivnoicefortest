import { useCallback } from "react"
import { Slide, type ToastPosition, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const toastOptions = {
  position: "bottom-right" as ToastPosition,
  autoClose: 3000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  transition: Slide,
}

const customStyleToast = {
  fontSize: "14px",
  fontWeight: 600,
  fontFamily: "Roboto",
}

const useCustomToast = () => {
  const showSuccess = useCallback((description: string) => {
    toast.success(description, {
      ...toastOptions,
      style: customStyleToast,
    })
  }, [])

  const showError = useCallback((description: string) => {
    toast.error(description, {
      ...toastOptions,
      style: customStyleToast,
    })
  }, [])

  const showWarning = useCallback((description: string) => {
    toast.warning(description, {
      ...toastOptions,
      style: customStyleToast,
    })
  }, [])

  const showInfo = useCallback((description: string) => {
    toast.info(description, {
      ...toastOptions,
      style: customStyleToast,
    })
  }, [])

  return { showSuccess, showError, showWarning, showInfo }
}

export default useCustomToast
