"use client";

import { useNotificationStore } from "@/lib/notification-store";

export function useNotifications() {
  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );
  const removeNotification = useNotificationStore(
    (state) => state.removeNotification
  );

  return {
    success: (title: string, message?: string) => {
      addNotification({
        type: "success",
        title,
        message,
        duration: 3000,
        icon: "✓",
      });
    },
    error: (title: string, message?: string) => {
      addNotification({
        type: "error",
        title,
        message,
        duration: 4000,
        icon: "✕",
      });
    },
    info: (title: string, message?: string) => {
      addNotification({
        type: "info",
        title,
        message,
        duration: 3000,
      });
    },
    warning: (title: string, message?: string) => {
      addNotification({
        type: "warning",
        title,
        message,
        duration: 4000,
      });
    },
    custom: addNotification,
    remove: removeNotification,
  };
}
