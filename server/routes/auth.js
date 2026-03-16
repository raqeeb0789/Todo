const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/forgot', ctrl.forgotPassword);
router.post('/reset', ctrl.resetPassword);
router.get('/me', auth, ctrl.getMe);

module.exports = router;
