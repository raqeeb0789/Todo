// controllers/todosController.js
const Todo = require('../models/Todo');

exports.createTodo = async (req, res) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Set default priority if not provided
    if (!req.body.priority) {
      req.body.priority = 'medium';
    }

    // Validate priority
    if (!['low', 'medium', 'high'].includes(req.body.priority)) {
      return res.status(400).json({ error: 'Invalid priority value' });
    }

    // Attach authenticated user
    const payload = { ...req.body, user: req.user && req.user.id };
    const todo = await Todo.create(payload);
    res.status(201).json(todo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getTodos = async (req, res) => {
  try {
    const filter = { user: req.user && req.user.id };
    const todos = await Todo.find(filter).sort({ scheduledAt: 1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user && req.user.id });
    if (!todo) return res.status(404).json({ error: 'Not found' });
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTodo = async (req, res) => {
  try {
    // Validate priority if it's being updated
    if (req.body.priority && !['low', 'medium', 'high'].includes(req.body.priority)) {
      return res.status(400).json({ error: 'Invalid priority value' });
    }

    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.user && req.user.id },
      req.body,
      {
        new: true,
        runValidators: true // This ensures enum validation runs on update
      }
    );
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.json(todo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user && req.user.id });
    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
