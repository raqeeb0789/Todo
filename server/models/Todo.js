// models/Todo.js
const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  scheduledAt: { type: Date }, // when it's scheduled (use ISO date)
  completed: { type: Boolean, default: false },
  remark: { type: String, default: '' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  isDaily: { type: Boolean, default: false }, // indicates if this is a daily recurring task
  lastCompletedAt: { type: Date }, // tracks when the task was last completed
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Todo', TodoSchema);
