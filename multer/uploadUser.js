const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/users/');
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `[${file.originalname.split('.')[0]}-${new Date().getTime()}]` + '.png'
    );
  },
});

const uploadUser = multer({ storage: storage });

module.exports = uploadUser;
