const router = require('express').Router();
const authenticateToken = require('../auth/authenticateToken');
const {
  createChannel,
  getChannels,
  modifyChannel,
  deleteChannel,
  getClientChannels,
} = require('../controllers/channelController.controller');
const uploadChannel = require('../multer/uploadChannel');

router.post(
  '/create',
  authenticateToken,
  uploadChannel.single('picture'),
  createChannel
);
router.put(
  '/modify/:id',
  authenticateToken,
  uploadChannel.single('picture'),
  modifyChannel
);
router.delete('/delete/:id', authenticateToken, deleteChannel);
router.get('/all', getChannels);
router.post('/client', getClientChannels);

module.exports = router;
