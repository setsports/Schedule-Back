const router = require('express').Router();
const authenticateToken = require('../auth/authenticateToken');
const {
  getWorkspaces,
  createWorkspace,
  modifyWorkspace,
  deleteWorkspace,
} = require('../controllers/workspaceController.controller');

router.get('/all', authenticateToken, getWorkspaces);
router.post('/create', authenticateToken, createWorkspace);
router.put('/modify/:id', authenticateToken, modifyWorkspace);
router.delete('/delete/:id', authenticateToken, deleteWorkspace);

module.exports = router;
