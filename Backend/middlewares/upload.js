// middlewares/upload.js
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads"); // ✅ ถูกบน Windows

// สร้างโฟลเดอร์ถ้ายังไม่มี
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
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function fileFilter(req, file, cb) {
  if (!allowedMime.has(file.mimetype)) {
    return cb(new Error("รองรับเฉพาะไฟล์รูป: jpg, png, webp, gif"), false);
  }
  cb(null, true);
}

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});
