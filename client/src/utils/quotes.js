// Professional and motivational quotes categorized by themes
export const quotes = {
  productivity: [
    {
      text: "Focus on being productive instead of busy.",
      author: "Tim Ferriss"
    },
    {
      text: "Your time is limited, don't waste it living someone else's life.",
      author: "Steve Jobs"
    },
    {
      text: "The way to get started is to quit talking and begin doing.",
      author: "Walt Disney"
    },
    {
      text: "It's not about having time. It's about making time.",
      author: "Unknown"
    }
  ],
  leadership: [
    {
      text: "Management is doing things right; leadership is doing the right things.",
      author: "Peter F. Drucker"
    },
    {
      text: "A leader is one who knows the way, goes the way, and shows the way.",
      author: "John C. Maxwell"
    },
    {
      text: "Innovation distinguishes between a leader and a follower.",
      author: "Steve Jobs"
    }
  ],
  success: [
    {
      text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill"
    },
    {
      text: "The only way to do great work is to love what you do.",
      author: "Steve Jobs"
    },
    {
      text: "Success usually comes to those who are too busy to be looking for it.",
      author: "Henry David Thoreau"
    }
  ],
  growth: [
    {
      text: "The only mistake that can truly hurt you is choosing to do nothing simply because you're too scared to make a mistake.",
      author: "Sarah Anderson"
    },
    {
      text: "Growth and comfort do not coexist.",
      author: "Ginni Rometty"
    },
    {
      text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
      author: "Nelson Mandela"
    }
  ],
  timeManagement: [
    {
      text: "Time is what we want most, but what we use worst.",
      author: "William Penn"
    },
    {
      text: "The bad news is time flies. The good news is you're the pilot.",
      author: "Michael Altshuler"
    },
    {
      text: "Yesterday is gone. Tomorrow has not yet come. We have only today. Let us begin.",
      author: "Mother Teresa"
    }
  ]
};

// Get a random quote based on task priority and time of day
export function getContextualQuote(priority, hour) {
  let category;
  
  // Morning quotes (5 AM - 11 AM)
  if (hour >= 5 && hour < 11) {
    category = priority === 'high' ? 'leadership' : 'productivity';
  }
  // Afternoon quotes (11 AM - 4 PM)
  else if (hour >= 11 && hour < 16) {
    category = priority === 'high' ? 'success' : 'timeManagement';
  }
  // Evening quotes (4 PM - 9 PM)
  else if (hour >= 16 && hour < 21) {
    category = priority === 'high' ? 'growth' : 'success';
  }
  // Night quotes (9 PM - 5 AM)
  else {
    category = 'timeManagement';
  }

  const categoryQuotes = quotes[category];
  return categoryQuotes[Math.floor(Math.random() * categoryQuotes.length)];
}

// Get quote based on completion streak
export function getStreakQuote(streak) {
  if (streak >= 7) {
    return {
      text: "A week of consistent excellence! You're building lasting success.",
      author: "Achievement Milestone"
    };
  } else if (streak >= 3) {
    return {
      text: "Three days of dedication! Keep this momentum going.",
      author: "Progress Tracker"
    };
  }
  return null;
}