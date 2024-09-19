const router = require('express').Router();
const authenticateToken = require('../auth/authenticateToken');
const {
  setWeek,
  getWeek,
} = require('../controllers/weekController.controller');

router.post('/set', authenticateToken, setWeek);
router.get('/get', getWeek);

module.exports = router;
