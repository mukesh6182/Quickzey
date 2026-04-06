const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Helper: ensure folder exists
function ensureFolderExists(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true }); // create nested folders if needed
  }
}


function createMulterUpload(folderName, maxSizeMB = 2) {
  const uploadPath = path.join(__dirname, '..', 'uploads', folderName);
  ensureFolderExists(uploadPath);

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueName = Date.now() + '-' + file.originalname.replace(/\s/g, '-');
      cb(null, uniqueName);
    }
  });

  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      return cb(new Error('Only images are allowed (jpg, jpeg, png, webp)'));
    }
    cb(null, true);
  };

  return multer({
    storage,
    limits: { fileSize: maxSizeMB * 1024 * 1024 }, // convert MB to bytes
    fileFilter
  });
}

module.exports = createMulterUpload;
