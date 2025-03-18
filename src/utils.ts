import { formatISO } from "date-fns"
import { format } from "date-fns"
import type { ApiError } from "./client"

export const emailPattern = {
  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  message: "Invalid email address",
}

export const namePattern = {
  value: /^[A-Za-z\s\u00C0-\u017F]{1,30}$/,
  message: "Invalid name",
}

export const passwordRules = (isRequired = true) => {
  const rules: any = {
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters",
    },
  }

  if (isRequired) {
    rules.required = "Password is required"
  }

  return rules
}

export const confirmPasswordRules = (
  getValues: () => any,
  isRequired = true,
) => {
  const rules: any = {
    validate: (value: string) => {
      const password = getValues().password || getValues().new_password
      return value === password ? true : "The passwords do not match"
    },
  }

  if (isRequired) {
    rules.required = "Password confirmation is required"
  }

  return rules
}

export const handleError = (err: ApiError, showToast: any) => {
  const errDetail = (err.body as any)?.detail
  let errorMessage = errDetail || "Something went wrong."
  if (Array.isArray(errDetail) && errDetail.length > 0) {
    errorMessage = errDetail[0].msg
  }
  showToast("Error", errorMessage, "error")
}

export const calculateTotalPages = (count: number, pageSize: number) => {
  return Math.ceil(count / pageSize)
}

export const getCurrentDateTimes = () => {
  return formatISO(new Date(), { representation: "date" })
}

export const formatDuration = (start: string, end: string) => {
  if (!start || !end) return ""

  const startDate = new Date(start).getTime()
  const endDate = new Date(end).getTime()

  if (endDate <= startDate) return "day".replace("{count}", "0")

  const diffInMs = endDate - startDate
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  const months = Math.floor(diffInDays / 30)
  const days = diffInDays % 30

  if (months === 0) {
    return `${days} ${days > 1 ? "days" : "day"}`
  }

  if (days === 0) {
    return `${months} ${months > 1 ? "months" : "month"}`
  }

  return `${months} ${months > 1 ? "months" : "month"} ${days} ${days > 1 ? "days" : "day"}`
}

export const formatDate = (
  date: string | number | Date,
  dateFormat = "dd-MMM-yyyy",
): string => {
  if (!date) return ""
  return format(new Date(date), dateFormat)
}
