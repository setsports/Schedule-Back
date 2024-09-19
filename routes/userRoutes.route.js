const router = require('express').Router();
const authenticateToken = require('../auth/authenticateToken');
const {
  createUser,
  authUser,
  checkAuth,
  logoutUser,
  getUser,
  getUsers,
  modifyUser,
  modifySingleUser,
  deleteUser,
} = require('../controllers/userController.controller');
const uploadUser = require('../multer/uploadUser');

router.get('/all', authenticateToken, getUsers);
router.get('/me', authenticateToken, getUser);
router.get('/check-auth', checkAuth);
router.post(
  '/create',
  authenticateToken,
  uploadUser.single('picture'),
  createUser
);
router.post('/auth', authUser);
router.post('/logout', authenticateToken, logoutUser);
router.put(
  '/modify',
  authenticateToken,
  uploadUser.single('picture'),
  modifyUser
);
router.put(
  '/modify/:id',
  authenticateToken,
  uploadUser.single('picture'),
  modifySingleUser
);
router.delete('/delete/:id', authenticateToken, deleteUser);

module.exports = router;
