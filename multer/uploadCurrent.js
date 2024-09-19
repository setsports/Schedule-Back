const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/users/');
  },
  filename: (req, file, cb) => {
    cb(null, `[${req.params.email}]` + '.png');
  },
});

const uploadCurrent = multer({ storage: storage });

module.exports = uploadCurrent;
