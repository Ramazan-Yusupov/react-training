import { useCallback, useState } from 'react';

export type BrowserNotificationPermission = NotificationPermission | 'unsupported';

function getPermission(): BrowserNotificationPermission {
  if (typeof Notification === 'undefined') {
    return 'unsupported';
  }

  return Notification.permission;
}

export function useBrowserNotifications() {
  const [permission, setPermission] = useState<BrowserNotificationPermission>(getPermission);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') {
      setPermission('unsupported');
      return 'unsupported';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch {
      setPermission(getPermission());
      return 'denied';
    }
  }, []);

  const notify = useCallback((title: string, body: string) => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
      return;
    }

    const notification = new Notification(title, {
      body,
      tag: 'planer-focus-timer',
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }, []);

  return {
    permission,
    requestPermission,
    notify,
  };
}
