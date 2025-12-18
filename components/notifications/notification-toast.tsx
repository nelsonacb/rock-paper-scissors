"use client"

import { useEffect } from "react"
import type { Notification } from "@/lib/notification-store"
import { useNotificationStore } from "@/lib/notification-store"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

interface NotificationToastProps {
  notification: Notification
}

export function NotificationToast({ notification }: NotificationToastProps) {
  const removeNotification = useNotificationStore((state) => state.removeNotification)

  useEffect(() => {
    if (notification.duration !== 0) {
      const timer = setTimeout(() => {
        removeNotification(notification.id)
      }, notification.duration || 4000)

      return () => clearTimeout(timer)
    }
  }, [notification, removeNotification])

  const getIcon = () => {
    if (notification.icon) {
      return <span className="text-xl">{notification.icon}</span>
    }

    switch (notification.type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />
      case "error":
        return <AlertCircle className="w-5 h-5" />
      case "warning":
        return <AlertTriangle className="w-5 h-5" />
      case "info":
      default:
        return <Info className="w-5 h-5" />
    }
  }

  const getBackgroundClass = () => {
    switch (notification.type) {
      case "success":
        return "bg-success text-success-foreground"
      case "error":
        return "bg-destructive text-destructive-foreground"
      case "warning":
        return "bg-accent text-accent-foreground"
      case "info":
      default:
        return "bg-primary text-primary-foreground"
    }
  }

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border border-border ${getBackgroundClass()} animate-in slide-in-from-bottom-4 fade-in duration-300`}
      role="alert"
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{notification.title}</p>
        {notification.message && <p className="text-xs opacity-90 mt-1">{notification.message}</p>}
      </div>
      <button
        onClick={() => removeNotification(notification.id)}
        className="flex-shrink-0 hover:opacity-80 transition-opacity"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
