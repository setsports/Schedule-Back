const router = require('express').Router();
const authenticateToken = require('../auth/authenticateToken');
const {
  uploadGames,
  getGames,
  uploadAppGames,
  getAppGames,
} = require('../controllers/gameController.controller');
const uploadExcel = require('../multer/uploadExcel');

router.post(
  '/upload/app',
  authenticateToken,
  uploadExcel.single('file'),
  uploadAppGames
);
router.post(
  '/upload',
  authenticateToken,
  uploadExcel.single('file'),
  uploadGames
);
router.post('/all', getGames);
router.post('/app', getAppGames);

module.exports = router;
