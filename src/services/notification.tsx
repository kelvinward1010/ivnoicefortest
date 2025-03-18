import { appConfigs } from "../configs/app"
const baseUrl = appConfigs.baseUrl
interface FetchNotificationsParams {
  pageIndex: number
  pageSize: number
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export const fetchNotifications = async ({
  pageIndex,
  pageSize,
  search,
  sortBy,
  sortOrder,
}: FetchNotificationsParams) => {
  //const token = localStorage.getItem("access_token") --TODO

  const res = await fetch(
    `${baseUrl}/notifications?page_index=${pageIndex}&page_size=${pageSize}&search=${search}&sort_by=${sortBy}&sort_order=${sortOrder}`,
  )

  if (!res.ok) {
    throw new Error("Failed to fetch notifications")
  }

  return res.json()
}

export const deleteAllNotifications = async () => {
  const res = await fetch(`${baseUrl}/notifications`, {
    method: "DELETE",
  })

  if (!res.ok) {
    throw new Error("Failed to delete all notifications")
  }

  return res.json()
}
export const updateAllNotifications = async () => {
  //const token = localStorage.getItem("access_token") --TODO
  const res = await fetch(`${baseUrl}/notifications`, {
    method: "PATCH",
  })

  if (!res.ok) {
    throw new Error("Failed to delete all notifications")
  }

  return res.json()
}
export const updateNotificationsStatus = async (notificationId?: string) => {
  //const token = localStorage.getItem("access_token") --TODO
  const res = await fetch(`${baseUrl}/notifications/${notificationId}`, {
    method: "PATCH",
  })

  if (!res.ok) {
    throw new Error("Failed to delete all notifications")
  }

  return res.json()
}
export const deleteNotification = async (notificationId?: string) => {
  //const token = localStorage.getItem("access_token") --TODO
  const res = await fetch(`${baseUrl}/notifications/${notificationId}`, {
    method: "DELETE",
  })

  if (!res.ok) {
    throw new Error("Failed to delete all notifications")
  }

  return res.json()
}
