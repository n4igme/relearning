const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.UPLOAD_PATH || 'uploads/');
  },
  filename: function (req, file, cb) {
    // Create unique filename
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Get allowed file types from environment variable
  const allowedTypes = process.env.ALLOWED_FILE_TYPES 
    ? process.env.ALLOWED_FILE_TYPES.split(',') 
    : ['video/mp4', 'application/pdf', 'text/plain'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Size limit
const maxSize = process.env.MAX_FILE_SIZE 
  ? parseInt(process.env.MAX_FILE_SIZE) 
  : 10 * 1024 * 1024; // 10MB default

const upload = multer({
  storage: storage,
  limits: {
    fileSize: maxSize
  },
  fileFilter: fileFilter
});

module.exports = upload;