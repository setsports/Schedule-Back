const router = require('express').Router();
const {
  createCountry,
  getCountries,
  modifyCountry,
  deleteCountry,
  getClientCountries,
  createAppCountry,
  getAppCountries,
  modifyAppCountry,
  deleteAppCountry,
} = require('../controllers/countryController.controller');
const authenticateToken = require('../auth/authenticateToken');
const uploadCountry = require('../multer/uploadCountry');

router.get('/app', getAppCountries);
router.post('/all', authenticateToken, getCountries);
router.post('/client', getClientCountries);
router.post(
  '/create',
  authenticateToken,
  uploadCountry.single('picture'),
  createCountry
);
router.post(
  '/create/app',
  authenticateToken,
  uploadCountry.single('picture'),
  createAppCountry
);
router.put(
  '/modify/:id',
  authenticateToken,
  uploadCountry.single('picture'),
  modifyCountry
);
router.put(
  '/modify/app/:id',
  authenticateToken,
  uploadCountry.single('picture'),
  modifyAppCountry
);
router.delete('/delete/:id', authenticateToken, deleteCountry);
router.delete('/delete/app/:id', authenticateToken, deleteAppCountry);

module.exports = router;
