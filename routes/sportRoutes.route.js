const router = require('express').Router();
const authenticateToken = require('../auth/authenticateToken');
const {
  createSport,
  getSports,
  modifySport,
  deleteSport,
} = require('../controllers/sportController.controller');

router.get('/all', getSports);
router.post('/create', authenticateToken, createSport);
router.put('/modify/:id', authenticateToken, modifySport);
router.delete('/delete/:id', authenticateToken, deleteSport);

module.exports = router;
