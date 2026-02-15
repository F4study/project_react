const pool = require('../db');
const path = require('path');
const fs = require('fs');

exports.DownloadByToken = async (req, res) => {
  const { token } = req.params;
  const [rows] = await pool.query('SELECT dt.*, p.file_path FROM download_tokens dt LEFT JOIN products p ON dt.product_id = p.id WHERE dt.token = ? LIMIT 1', [token]);
  if (rows.length === 0) return res.status(404).json({ status: false, message: 'ไม่พบ token' });
  const rec = rows[0];
  const now = new Date();
  const expires = new Date(rec.expires_at);
  if (now > expires) return res.status(410).json({ status: false, message: 'token หมดอายุ' });

  const fileRel = rec.file_path;
  if (!fileRel) return res.status(404).json({ status: false, message: 'ไม่มีไฟล์ให้ดาวน์โหลด' });

  const filePath = path.join(__dirname, '..', fileRel);
  if (!fs.existsSync(filePath)) return res.status(404).json({ status: false, message: 'ไฟล์ไม่พบบนเซิร์ฟเวอร์' });

  res.download(filePath);
};

module.exports = exports;
