// routes/todos.js
const express = require('express');

const router = express.Router();
const ctrl = require('../controllers/todosController');
const auth = require('../middleware/auth');

// Protect all todo routes
router.use(auth);

router.post('/', ctrl.createTodo);
router.get('/', ctrl.getTodos);
router.get('/:id', ctrl.getTodo);
router.put('/:id', ctrl.updateTodo);
router.delete('/:id', ctrl.deleteTodo);

module.exports = router;
