import React from 'react';
import { format } from 'date-fns';
import '../styles/TodoItem.css';

function TodoItem({ todo, onToggle, onDelete, onUpdateRemark }) {
  return (
    <div className={`todo-item priority-${todo.priority || 'medium'} ${todo.completed ? 'done' : ''}`}>
      <div className="header">
        <div 
          className="checkbox"
          onClick={() => onToggle(todo)}
          style={{ background: todo.completed ? 'var(--success)' : 'transparent' }}
        />
        <div className="meta">
          <div className="title">{todo.title}</div>
          {todo.description && (
            <div className="description">{todo.description}</div>
          )}
          <div className="info">
            {todo.scheduledAt && (
              <div className="tag scheduled">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                {format(new Date(todo.scheduledAt), 'MMM d, yyyy HH:mm')}
              </div>
            )}
            <div className={`tag priority-tag ${todo.priority || 'medium'}`}>
              {todo.priority === 'high' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
                </svg>
              )}
              {todo.priority === 'medium' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14"/>
                </svg>
              )}
              {todo.priority === 'low' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 9l-7 7-7-7"/>
                </svg>
              )}
              {todo.priority ? todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1) : 'Medium'} Priority
            </div>
          </div>
        </div>
      </div>

      <div className="footer">
        <div className="remark">
          <input 
            type="text" 
            placeholder="Add a note..." 
            defaultValue={todo.remark || ''} 
            onBlur={(e)=>onUpdateRemark(todo, e.target.value)}
          />
        </div>
        <div className="actions">
          {!todo.completed && (
            <button className="action-btn" onClick={() => onToggle(todo)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              Complete
            </button>
          )}
          <button className="action-btn delete" onClick={()=>onDelete(todo)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default TodoItem;