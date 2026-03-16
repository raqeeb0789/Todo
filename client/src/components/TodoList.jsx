import React from 'react';
import TodoItem from './TodoItem';
import '../styles/TodoList.css';

function TodoList({ todos, view, onToggle, onDelete, onUpdateRemark }) {
  return (
    <div className={`todo-list ${view === 'list' ? 'list-view' : ''}`}>
      {todos.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="48" height="48">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <h3>No tasks found</h3>
          <p>Time to add some new tasks to your list!</p>
        </div>
      ) : (
        todos.map(todo => (
          <TodoItem
            key={todo._id}
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
            onUpdateRemark={onUpdateRemark}
          />
        ))
      )}
    </div>
  );
}

export default TodoList;