const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/channels/');
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `[${file.originalname.split('.')[0]}-${new Date().getTime()}]` + '.png'
    );
  },
});

const uploadChannel = multer({ storage: storage });

module.exports = uploadChannel;
