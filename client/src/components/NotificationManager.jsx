import React, { useEffect, useState } from 'react';

export default function NotificationManager() {
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    try {
      if ('Notification' in window) {
        const result = await Notification.requestPermission();
        setPermission(result);
        
        // Show a test notification if permission was granted
        if (result === 'granted') {
          const notification = new Notification('Notifications Enabled! 🎉', {
            body: 'You will now receive notifications for your tasks.',
            icon: '/favicon.ico'
          });
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  if (!('Notification' in window)) {
    return (
      <div className="notification-manager warning">
        Your browser doesn't support notifications
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="notification-manager error">
        Notifications are blocked. Please enable them in your browser settings.
      </div>
    );
  }

  if (permission === 'default') {
    return (
      <div className="notification-manager">
        <button onClick={requestPermission}>
          Enable Notifications
        </button>
      </div>
    );
  }

  return null;
}