import type { NotificationSeverity } from "./enums"

export interface NotificationDto {
  id: string
  title: Record<string, string> | null
  message: Record<string, string> | null
  severity: NotificationSeverity
  isActive: boolean
  startAt: string
  endAt: string | null
  dateCreated: string
  updatedAt: string | null
}

export interface CreateNotificationDto {
  title: Record<string, string> | null
  message: Record<string, string> | null
  severity: NotificationSeverity
  isActive: boolean
  startAt: string
  endAt: string | null
}

export interface UpdateNotificationDto {
  title: Record<string, string> | null
  message: Record<string, string> | null
  severity: NotificationSeverity
  isActive: boolean
  startAt: string
  endAt: string | null
}
