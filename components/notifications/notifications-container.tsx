"use client";

import { useNotificationStore } from "@/lib/notification-store";
import { NotificationToast } from "./notification-toast";

export function NotificationsContainer() {
  const notifications = useNotificationStore((state) => state.notifications);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-sm w-full px-4">
      {notifications.map((notification) => (
        <NotificationToast key={notification.id} notification={notification} />
      ))}
    </div>
  );
}
