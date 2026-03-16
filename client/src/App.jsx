// src/App.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { isSameHour, isSameMinute, isSameDay, parseISO, isAfter, startOfDay, differenceInDays } from 'date-fns';
import { useNotifications } from './hooks/useNotifications';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import './App.css';
import Sidebar from './components/Sidebar';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import NotificationManager from './components/NotificationManager';
import ResetPassword from './components/ResetPassword';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const QUOTES = [
  "Do one thing that scares you.",
  "Small steps each day add up.",
  "Start where you are — use what you have.",
  "Progress, not perfection."
];

function sampleQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

function App() {
  const [todos, setTodos] = useState([]);
  const [view, setView] = useState('grid');
  const [sortBy, setSortBy] = useState('date');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(
    "Notification" in window ? Notification.permission : "denied"
  );
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('token'));
  const [authUser, setAuthUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch (e) { return null; }
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showForgot, setShowForgot] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetParams, setResetParams] = useState({ token: null, email: null });

  // Note: we render errors inside the main JSX (not via early return)

  const fetchTodos = async () => {
    try {
      console.log('Fetching todos from:', `${API}/todos`);
      const res = await axios.get(`${API}/todos`);
      console.log('Todos received:', res.data);
      setTodos(res.data);
    } catch (err) {
      console.error('Error fetching todos:', err);
      if (err.response?.status === 401) {
        // Token invalid or expired — log the user out and show a friendly message
        try { handleLogout(); } catch (e) {}
        setError('Session expired or unauthorized. Please login again.');
      } else {
        const message = err.response?.data?.error || err.message || 'Failed to fetch todos';
        setError(message);
      }
    }
  };

  // Apply token to axios headers when present
  useEffect(() => {
    if (authToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [authToken]);

  useEffect(()=> {
    // If there is a token stored, fetch todos for the authenticated user
    if (authToken) fetchTodos();

    // If URL contains reset token, show reset modal
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const email = params.get('email');
      if (token && email) {
        setResetParams({ token, email });
        setShowReset(true);
      }
    } catch (e) {}
  }, [authToken]);

  const addOrUpdate = async (todoData) => {
    try {
      if (!todoData.title) {
        throw new Error('Title is required');
      }

      // Format the date properly if it exists
      if (todoData.scheduledAt) {
        todoData.scheduledAt = new Date(todoData.scheduledAt).toISOString();
      }

      const response = await axios.post(`${API}/todos`, todoData);
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      await fetchTodos();
      return response.data;
    } catch (err) {
      console.error('Failed to create todo:', err);
      const message = err.response?.data?.error || err.message || 'Failed to create todo';
      alert(`Error: ${message}. Please try again.`);
      throw err; // Re-throw to let the form component know there was an error
    }
  };

  const toggle = async (todo) => {
    const now = new Date();
    await axios.put(`${API}/todos/${todo._id}`, { 
      completed: !todo.completed,
      lastCompletedAt: !todo.completed ? now : null 
    });
    await fetchTodos();
  };

  const del = async (todo) => {
    if (!confirm('Delete?')) return;
    await axios.delete(`${API}/todos/${todo._id}`);
    await fetchTodos();
  };

  const updateRemark = async (todo, remark) => {
    await axios.put(`${API}/todos/${todo._id}`, { remark });
    await fetchTodos();
  };

  // Initialize notifications
  useNotifications({ todos, onToggle: toggle });

  // Ensure audio playback is unlocked by a user gesture (for notification sounds)
  useEffect(() => {
    let unlocked = false;
    const markUnlocked = () => {
      if (unlocked) return;
      unlocked = true;
      try { window.__audioUnlocked = true; } catch (e) {}

      try {
        // Try resuming WebAudio if available
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended' && ctx.resume) {
            ctx.resume().catch(() => {});
          }
          // Create a short, nearly inaudible beep to satisfy gesture requirement
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'sine';
          o.frequency.value = 440;
          g.gain.value = 0.0001;
          o.connect(g);
          g.connect(ctx.destination);
          o.start();
          setTimeout(() => { try { o.stop(); ctx.close(); } catch (e) {} }, 50);
        } else {
          // Fallback to HTMLAudioElement
          const a = new Audio('/notification.mp3');
          a.volume = 0.0001;
          a.play().then(() => { try { a.pause(); a.currentTime = 0; } catch (e) {} }).catch(() => {});
        }
      } catch (e) {}

      window.removeEventListener('click', markUnlocked);
      window.removeEventListener('keydown', markUnlocked);
      window.removeEventListener('touchstart', markUnlocked, { passive: true });
    };

    window.addEventListener('click', markUnlocked);
    window.addEventListener('keydown', markUnlocked);
    window.addEventListener('touchstart', markUnlocked, { passive: true });

    return () => {
      window.removeEventListener('click', markUnlocked);
      window.removeEventListener('keydown', markUnlocked);
      window.removeEventListener('touchstart', markUnlocked, { passive: true });
    };
  }, []);

  const [filter, setFilter] = useState('all');
  
  const filteredTodos = todos.filter(todo => {
    const today = startOfDay(new Date());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch(filter) {
      case 'today': {
        if (!todo.scheduledAt) return false;
        const todoDate = startOfDay(parseISO(todo.scheduledAt));
        return todoDate.getTime() === today.getTime();
      }
      case 'upcoming': {
        if (!todo.scheduledAt) return false;
        const todoDate = parseISO(todo.scheduledAt);
        return isAfter(todoDate, tomorrow);
      }
      case 'completed':
        return todo.completed;
      case 'pending':
        return !todo.completed;
      default:
        return true;
    }
  }).sort((a, b) => {
    switch(sortBy) {
      case 'date': {
        // Handle cases where scheduledAt is missing
        if (!a.scheduledAt && !b.scheduledAt) return 0;
        if (!a.scheduledAt) return 1; // Move items without date to the end
        if (!b.scheduledAt) return -1; // Move items without date to the end
        
        const dateA = parseISO(a.scheduledAt);
        const dateB = parseISO(b.scheduledAt);
        return dateA.getTime() - dateB.getTime();
      }
      case 'priority': {
        const priorityMap = { high: 3, medium: 2, low: 1 };
        const priorityA = priorityMap[a.priority] || 2; // Default to medium if undefined
        const priorityB = priorityMap[b.priority] || 2; // Default to medium if undefined
        
        // If priorities are equal, sort by date as secondary criteria
        if (priorityA === priorityB) {
          if (!a.scheduledAt && !b.scheduledAt) return 0;
          if (!a.scheduledAt) return 1;
          if (!b.scheduledAt) return -1;
          return new Date(a.scheduledAt) - new Date(b.scheduledAt);
        }
        
        return priorityB - priorityA; // Higher priority first
      }
      case 'name':
        return (a.title || '').localeCompare(b.title || '');
      default:
        return 0;
    }
  });

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    pending: todos.filter(t => !t.completed).length,
    upcoming: todos.filter(t => t.scheduledAt && isAfter(parseISO(t.scheduledAt), new Date())).length
  };

  // Function to request notification permission
  const requestNotificationPermission = async () => {
    try {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        if (permission === "granted") {
          // Send a test notification
          new Notification("Todo App Notifications Enabled", {
            body: "You will now receive notifications for your tasks!",
            icon: "/favicon.ico"
          });
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  // Authentication helpers
  const handleAuthSuccess = (token, user) => {
    setAuthToken(token);
    setAuthUser(user || null);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user || null));
    setShowAuthModal(false);
    setShowForgot(false);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setAuthUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <div className={`app ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
      {error && (
        <div style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.3)',
          zIndex: 2000
        }}>
          <div style={{
            background: 'white',
            padding: 24,
            borderRadius: 8,
            maxWidth: 600,
            width: '90%',
            textAlign: 'center'
          }}>
            <h2 style={{ color: 'var(--error)', marginBottom: '1rem' }}>Something went wrong</h2>
            <p style={{ marginBottom: '1rem', color: 'var(--gray-600)' }}>{String(error)}</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button onClick={() => window.location.reload()} className="btn">Refresh Page</button>
              <button onClick={() => setError(null)} className="btn btn-ghost">Dismiss</button>
            </div>
          </div>
        </div>
      )}
      {/* Top-right username and logout button after login */}
      {authToken && authUser && (
        <div className="topbar-user">
          <span>{authUser.name || authUser.email}</span>
          <button className="btn" onClick={handleLogout}>Logout</button>
        </div>
      )}
      {authToken && (
        <Sidebar 
          stats={stats} 
          filter={filter} 
          setFilter={setFilter}
          isOpen={isSidebarOpen}
        />
      )}
      {authToken && (
        <button 
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isSidebarOpen ? (
              <path d="M15 19l-7-7 7-7"/>
            ) : (
              <path d="M9 19l7-7-7-7"/>
            )}
          </svg>
        </button>
      )}
      
      <div className="main-content">
        <NotificationManager />
        {/* Show only lamp login page until authenticated */}
        {!authToken && (
          <>
            {!showForgot && !showReset && (
              <Login onSuccess={handleAuthSuccess} onForgot={() => setShowForgot(true)} />
            )}
            {showForgot && (
              <div style={{ marginTop: 16 }}>
                <ForgotPassword onDone={() => setShowForgot(false)} />
              </div>
            )}
            {showReset && (
              <div style={{ marginTop: 16 }}>
                <ResetPassword 
                  tokenFromUrl={resetParams.token} 
                  emailFromUrl={resetParams.email}
                  onDone={() => setShowReset(false)}
                />
              </div>
            )}
          </>
        )}
        {authToken && (
          <>
            <TodoForm onSaved={addOrUpdate} />
            <div className="tasks-header">
              <h2>Tasks</h2>
              <div className="view-options">
                <div className="view-toggle">
                  <button 
                    className={view === 'grid' ? 'active' : ''}
                    onClick={() => setView('grid')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/>
                    </svg>
                  </button>
                  <button 
                    className={view === 'list' ? 'active' : ''}
                    onClick={() => setView('list')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                  </button>
                </div>
                <select 
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date">Sort by Date</option>
                  <option value="priority">Sort by Priority</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>
            </div>
            <TodoList 
              todos={filteredTodos}
              view={view}
              onToggle={toggle}
              onDelete={del}
              onUpdateRemark={updateRemark}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
