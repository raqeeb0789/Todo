import React from 'react';
import '../styles/Sidebar.css';

function Sidebar({ stats, filter, setFilter, isOpen }) {
  return (
    <div className={`sidebar ${!isOpen ? 'collapsed' : ''}`}>
      <div className="logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <h1>Task Master Pro</h1>
      </div>

      <div className="sidebar-nav">
        <div 
          className={`nav-item ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18"/>
          </svg>
          All Tasks
        </div>
        <div 
          className={`nav-item ${filter === 'today' ? 'active' : ''}`}
          onClick={() => setFilter('today')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          Today's Tasks
        </div>
        <div 
          className={`nav-item ${filter === 'upcoming' ? 'active' : ''}`}
          onClick={() => setFilter('upcoming')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          Upcoming
        </div>
        <div 
          className={`nav-item ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          Completed
        </div>
        <div 
          className={`nav-item ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4m0 4h.01"/>
          </svg>
          Pending
        </div>
      </div>

      <div className="stats-container">
        <h2>Overview</h2>
        <div className="stats">
          <div className="stat-card">
            <h3>{stats.total}</h3>
            <p>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              Total Tasks
            </p>
          </div>
          <div className="stat-card">
            <h3>{stats.completed}</h3>
            <p>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              Completed
            </p>
          </div>
          <div className="stat-card">
            <h3>{stats.pending}</h3>
            <p>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4m0 4h.01"/>
              </svg>
              Pending
            </p>
          </div>
          <div className="stat-card">
            <h3>{stats.upcoming}</h3>
            <p>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              Upcoming
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;