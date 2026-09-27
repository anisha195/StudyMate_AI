const multer = require("multer");

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are supported"), false);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB per file
});

module.exports = upload;
