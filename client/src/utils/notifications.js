import { getContextualQuote, getStreakQuote } from './quotes';

class NotificationService {
  constructor() {
    this.permission = null;
    this.notificationQueue = [];
    this.notificationSound = new Audio('/notification.mp3'); // Add a subtle notification sound file
  }

  async initialize() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permission = 'granted';
      return true;
    }

    if (Notification.permission !== 'denied') {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    }

    return false;
  }

  async scheduleNotification(todo, streak = 0) {
    const now = new Date();
    const quote = getContextualQuote(todo.priority, now.getHours());
    const streakQuote = streak > 0 ? getStreakQuote(streak) : null;

    // Prepare notification content
    const title = `🎯 ${todo.title}`;
    let body = `"${quote.text}" - ${quote.author}\n\n`;
    
    if (todo.description) {
      body += `📝 ${todo.description}\n`;
    }
    
    if (todo.isDaily) {
      body += `🔄 Daily Task\n`;
    }
    
    if (streakQuote) {
      body += `\n🏆 ${streakQuote.text}`;
    }

    // Notification options
    const options = {
      body,
      icon: '/favicon.ico', // Add your app icon
      badge: '/badge.png', // Add a notification badge
      tag: todo._id, // Prevent duplicate notifications
      renotify: true, // Allow renotification for daily tasks
      silent: false, // Use system sound
      actions: [
        {
          action: 'complete',
          title: '✅ Mark Complete'
        },
        {
          action: 'snooze',
          title: '⏰ Snooze 5min'
        }
      ]
    };

    try {
      // Play subtle notification sound
      this.notificationSound.play().catch(() => {});

      // Show notification
      if (this.permission === 'granted') {
        const notification = new Notification(title, options);
        
        // Handle notification interactions
        notification.onclick = (event) => {
          event.preventDefault();
          window.focus();
          
          if (event.action === 'complete') {
            // Trigger todo completion
            todo.onComplete && todo.onComplete();
          } else if (event.action === 'snooze') {
            // Reschedule notification
            setTimeout(() => {
              this.scheduleNotification(todo, streak);
            }, 5 * 60 * 1000); // 5 minutes
          }
        };
      } else {
        // Fallback to alert with simpler message
        alert(`${title}\n\n${options.body}`);
      }
    } catch (error) {
      console.error('Notification failed:', error);
    }
  }
}

export const notificationService = new NotificationService();