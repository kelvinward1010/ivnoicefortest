export type NotificationBase = {
  message: string
  status: string
  created_at: string
  link: string
  actor_id: string
  receiver_id: string
}

export type NotificationPublic = NotificationBase & {
  id: string
}

export enum NotificationStatus {
  UNREAD = "UNREAD",
  READ = "READ",
}

export type NotificationPublics = {
  notifications: NotificationPublic[]
  number_of_unread: number
  count: number
}

export type UpdateNotificationStatus = {
  notification_ids: string[]
}
