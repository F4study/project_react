const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = crypto.randomBytes(16).toString("hex") + ext;
    cb(null, safeName);
  },
});

const allowedMime = new Set([
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/octet-stream",
]);

function fileFilter(req, file, cb) {
  if (!allowedMime.has(file.mimetype)) {
    return cb(new Error("รองรับเฉพาะไฟล์ PDF หรือ ZIP"), false);
  }
  cb(null, true);
}

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
});
