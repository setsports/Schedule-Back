const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const workspace = req.body.workspace;
    cb(
      null,
      `${
        workspace === 'English'
          ? 'uploads/english'
          : workspace === 'Georgian'
          ? 'uploads/georgian'
          : workspace === 'Russian'
          ? 'uploads/russian'
          : 'uploads/app'
      }`
    );
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const uploadExcel = multer({ storage: storage });

module.exports = uploadExcel;
