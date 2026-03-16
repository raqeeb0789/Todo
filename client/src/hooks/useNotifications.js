import { useEffect } from 'react';
import { getContextualQuote, getStreakQuote } from '../utils/quotes';

export function useNotifications({ todos, onToggle }) {
  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        if ("Notification" in window) {
          const permission = await Notification.requestPermission();
          console.log('Notification permission:', permission);
          
          // Show a test notification if permission was granted
          if (permission === "granted") {
            const testNotification = new Notification("Todo App Notifications Active", {
              body: "You will now receive notifications for your tasks at their scheduled times!",
              icon: "/vite.svg",
              badge: "/vite.svg"
            });

            // Auto-close the test notification after 5 seconds
            setTimeout(() => testNotification.close(), 5000);
          }
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    };

    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (!todos.length) return;

    // Store timeouts so we can clear them when the component unmounts
    const timeouts = new Set();

    // Function to show the notification
    const showNotification = (todo) => {
      // Play sound: prefer WebAudio oscillator (no external file), fall back to audio file if needed
      const playSound = () => {
        try {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            o.frequency.value = 880; // A5-ish beep
            g.gain.value = 0.05; // low volume
            o.connect(g);
            g.connect(ctx.destination);
            o.start();
            setTimeout(() => {
              try { o.stop(); ctx.close(); } catch (e) {}
            }, 150);
            return;
          }
        } catch (err) {
          console.warn('WebAudio failed, falling back to Audio element:', err);
        }

        // Fallback to HTMLAudioElement with format checks
        try {
          const audioFormats = [
            { src: '/notification.mp3', type: 'audio/mpeg' },
            { src: '/notification.ogg', type: 'audio/ogg' },
            { src: '/notification.wav', type: 'audio/wav' }
          ];

          const audio = new Audio();
          const supported = audioFormats.find(f => {
            try {
              return !!(audio.canPlayType && audio.canPlayType(f.type));
            } catch (e) {
              return false;
            }
          });
          if (supported) {
            audio.src = supported.src;
            audio.play().catch(err => console.warn('Audio play failed:', err));
          } else {
            console.warn('No supported audio format found for notifications; skipping sound.');
          }
        } catch (error) {
          console.warn('Error attempting to play notification sound:', error);
        }
      };

      try {
        playSound();
      } catch (err) {
        console.warn('Notification sound play error:', err);
      }

      // Show notification with a contextual quote and optional streak message
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          const now = new Date();
          const priority = todo.priority || 'medium';
          const quote = getContextualQuote(priority, now.getHours());
          const streak = todo.isDaily ? parseInt(localStorage.getItem(`streak-${todo._id}`) || '0') : 0;
          const streakQuote = getStreakQuote(streak);

          let body = `"${quote.text}" - ${quote.author}\n\n`;
          if (todo.description) body += `📝 ${todo.description}\n`;
          if (todo.isDaily) body += `🔄 Daily Task\n`;
          if (streakQuote) body += `\n🏆 ${streakQuote.text}`;

          const notification = new Notification(`🎯 ${todo.title}`, {
            body,
            icon: '/vite.svg',
            badge: '/vite.svg',
            tag: todo._id,
            requireInteraction: true
          });

          notification.onclick = (event) => {
            event.preventDefault();
            window.focus();
            try { onToggle(todo); } catch (e) { console.warn('onToggle failed from notification click', e); }
          };
        } catch (error) {
          console.error('Error showing notification with quote:', error);
          alert(`🎯 Time for: ${todo.title}\n${todo.description || ''}`);
        }
      } else {
        // Fallback alert with quote information
        try {
          const now = new Date();
          const priority = todo.priority || 'medium';
          const quote = getContextualQuote(priority, now.getHours());
          const streak = todo.isDaily ? parseInt(localStorage.getItem(`streak-${todo._id}`) || '0') : 0;
          const streakQuote = getStreakQuote(streak);
          let msg = `"${quote.text}" - ${quote.author}\n\n`;
          if (todo.description) msg += `${todo.description}\n`;
          if (streakQuote) msg += `\n🏆 ${streakQuote.text}`;
          alert(`${todo.title}\n\n${msg}`);
        } catch (err) {
          alert(`🎯 Time for: ${todo.title}\n${todo.description || ''}`);
        }
      }
    };

    // Function to schedule a notification
    const scheduleNotification = (todo) => {
      if (!todo.scheduledAt || todo.completed) return;

      const scheduled = new Date(todo.scheduledAt);
      const now = new Date();
      
      // For daily tasks, adjust the scheduled time to today if it's in the past
      if (todo.isDaily && scheduled < now) {
        scheduled.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
        if (scheduled < now) {
          scheduled.setDate(scheduled.getDate() + 1); // Move to tomorrow if today's time has passed
        }
      }

      // Calculate delay until notification
      const delay = scheduled.getTime() - now.getTime();
      
      // Skip if the time has passed (for non-daily tasks) or if it's too far in the future
      if (!todo.isDaily && delay < 0) return;
      if (delay > 2147483647) return; // Skip if more than 24.85 days away (setTimeout limit)

      const notificationKey = `${todo._id}-${scheduled.toISOString()}`;
      if (localStorage.getItem(notificationKey)) return;
      
      const timeoutId = setTimeout(() => {
        if (todo.completed) return; // Recheck completion status when timeout triggers
        localStorage.setItem(notificationKey, 'shown');
        showNotification(todo);
        
        // Schedule next notification for daily tasks
        if (todo.isDaily) {
          const nextDay = new Date(scheduled);
          nextDay.setDate(nextDay.getDate() + 1);
          scheduleNotification({
            ...todo,
            scheduledAt: nextDay.toISOString()
          });
        }
      }, delay);

      timeouts.add(timeoutId);
    };

    // Schedule notifications for all todos
    todos.forEach(scheduleNotification);

    // Heartbeat poll: mitigates background timer throttling by checking for due items periodically
    const pollIntervalMs = 30000; // 30s
    const intervalId = setInterval(() => {
      try {
        const now = new Date();
        todos.forEach((todo) => {
          if (!todo || !todo.scheduledAt || todo.completed) return;
          const scheduled = new Date(todo.scheduledAt);
          if (scheduled > now) return;

          const notificationKey = `${todo._id}-${scheduled.toISOString()}`;
          if (localStorage.getItem(notificationKey)) return;

          // Mark and notify
          localStorage.setItem(notificationKey, 'shown');
          showNotification(todo);
        });
      } catch (e) {
        console.warn('Notification heartbeat check failed:', e);
      }
    }, pollIntervalMs);

    // Cleanup function
    return () => {
      timeouts.forEach(clearTimeout);
      timeouts.clear();
      try { clearInterval(intervalId); } catch (e) {}
    };
  }, [todos, onToggle]);
}