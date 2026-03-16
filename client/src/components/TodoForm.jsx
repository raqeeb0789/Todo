import React, { useState } from 'react';
import '../styles/TodoForm.css';

function TodoForm({ onSaved }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isDaily, setIsDaily] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please provide a title');
      return;
    }

    try {
      await onSaved({
        title: title.trim(), 
        description: description.trim(), 
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        priority,
        isDaily
      });

      // Only reset form if submission was successful
      setTitle(''); 
      setDescription(''); 
      setScheduledAt('');
      setPriority('medium');
      setIsDaily(false);
    } catch (error) {
      // Error is already handled by the parent component
      console.error('Form submission error:', error);
    }
  };

  return (
    <form className="todo-form" onSubmit={submit}>
      <div className="form-grid">
        <div className="form-group full-width">
          <label>Task Title</label>
          <input 
            placeholder="What needs to be done?" 
            value={title} 
            onChange={e=>setTitle(e.target.value)}
          />
        </div>
        <div className="form-group full-width">
          <label>Description</label>
          <input 
            placeholder="Add some details..." 
            value={description} 
            onChange={e=>setDescription(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Schedule</label>
          <input 
            type="datetime-local" 
            value={scheduledAt} 
            onChange={e=>setScheduledAt(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Priority</label>
          <select 
            value={priority} 
            onChange={e=>setPriority(e.target.value)}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>
        <div className="form-group checkbox-group" style={{ alignSelf: 'end' }}>
          <label title="Task will repeat daily at the scheduled time">
            <input
              type="checkbox"
              checked={isDaily}
              onChange={e => setIsDaily(e.target.checked)}
            />
            <span>Daily Task</span>
            {isDaily && (
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="var(--primary)" 
                strokeWidth="2" 
                width="16" 
                height="16"
              >
                <path d="M12 2v2m0 16v2M4 12H2m20 0h-2m-2.05-5.95l-1.41 1.41M5.46 18.54l-1.41 1.41m0-15.9l1.41 1.41m12.72 12.72l1.41 1.41M17 12a5 5 0 11-10 0 5 5 0 0110 0z"/>
              </svg>
            )}
          </label>
        </div>
        <button type="submit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <path d="M12 4v16m-8-8h16"/>
          </svg>
          Add New Task
        </button>
      </div>
    </form>
  );
}

export default TodoForm;