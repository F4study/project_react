const e = require("express");
const pool = require("../db");
const bcrypt = require("bcrypt");

exports.ChangePassword = async (req, res) => {
  // Expecting authenticated request. Use req.user.id from JWT.
  const userId = req.user?.id;
  const { current_password, new_password } = req.body;

  if (!userId) {
    return res.status(401).json({ status: false, message: 'Unauthorized' });
  }
  if (!current_password || !new_password) {
    return res.status(400).json({ status: false, message: 'Missing password fields' });
  }

  const sqlSelect = 'SELECT * FROM users WHERE u_id = ? LIMIT 1';
  const [rows] = await pool.query(sqlSelect, [userId]);
  if (rows.length === 0) {
    return res.status(404).json({ status: false, message: 'ไม่พบผู้ใช้' });
  }

  const user = rows[0];
  const isMatch = await bcrypt.compare(current_password, user.password_hash);
  if (!isMatch) {
    return res.status(400).json({ status: false, message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });
  }

  const hashedPassword = await bcrypt.hash(new_password, 10);
  const _now = new Date();
  const _utc = _now.getTime() + _now.getTimezoneOffset() * 60000;
  const _th = new Date(_utc + 7 * 60 * 60 * 1000);
  const date =
    _th.getFullYear() +
    '-' +
    String(_th.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(_th.getDate()).padStart(2, '0') +
    ' ' +
    String(_th.getHours()).padStart(2, '0') +
    ':' +
    String(_th.getMinutes()).padStart(2, '0') +
    ':' +
    String(_th.getSeconds()).padStart(2, '0');

  const sql = 'UPDATE users SET password_hash = ?, updated_at = ? WHERE u_id = ?';
  const [result] = await pool.query(sql, [hashedPassword, date, userId]);
  res.status(200).json({ status: true, message: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว' });
};

exports.GetUser = async (req, res) => {
  const { u_id } = req.params;

  if (u_id) {
    sql =
      "SELECT u_id, display_name, username, email, role_id, avatar_url, created_at, updated_at FROM users WHERE u_id = ? LIMIT 1";
  } else {
    sql =
      "SELECT u_id, display_name, username, email, role_id, avatar_url, created_at, updated_at FROM users";
  }
  const [rows] = await pool.query(sql, [u_id]);
  res.json({ status: true, data: rows });
};

exports.UpdateUser = async (req, res) => {
  const { u_id } = req.params;
  const { display_name, username, email, role_id, avatar_url, is_approved } = req.body;

  // Authorization: allow admins, or allow users to update their own profile only
  const requester = req.user || {};
  const requesterRole = requester.role_name || requester.role;
  if (String(requesterRole).toLowerCase() !== 'admin' && Number(requester.id) !== Number(u_id)) {
    return res.status(403).json({ status: false, message: 'ไม่ได้รับอนุญาตให้แก้ไขผู้ใช้นี้' });
  }

  // If not admin, prevent changing role or approval
  if (String(requesterRole).toLowerCase() !== 'admin') {
    if (role_id !== undefined || is_approved !== undefined) {
      return res.status(403).json({ status: false, message: 'ไม่ได้รับอนุญาตให้แก้ไขฟิลด์นี้' });
    }
  }

  const _now = new Date();
  const _utc = _now.getTime() + _now.getTimezoneOffset() * 60000;
  const _th = new Date(_utc + 7 * 60 * 60 * 1000);
  const date =
    _th.getFullYear() +
    "-" +
    String(_th.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(_th.getDate()).padStart(2, "0") +
    " " +
    String(_th.getHours()).padStart(2, "0") +
    ":" +
    String(_th.getMinutes()).padStart(2, "0") +
    ":" +
    String(_th.getSeconds()).padStart(2, "0");

  // Build dynamic SQL based on provided fields
  const fields = [];
  const values = [];

  if (display_name !== undefined) {
    fields.push("display_name = ?");
    values.push(display_name);
  }
  if (username !== undefined) {
    fields.push("username = ?");
    values.push(username);
  }
  if (email !== undefined) {
    fields.push("email = ?");
    values.push(email);
  }
  if (role_id !== undefined) {
    fields.push("role_id = ?");
    values.push(role_id);
  }
  if (avatar_url !== undefined) {
    fields.push("avatar_url = ?");
    values.push(avatar_url);
  }
  if (is_approved !== undefined) {
    fields.push("is_approved = ?");
    values.push(is_approved);
  }

  fields.push("updated_at = ?");
  values.push(date);
  values.push(u_id);

  const sql = `UPDATE users SET ${fields.join(", ")} WHERE u_id = ?`;
  const [result] = await pool.query(sql, values);
  res.json({ status: true, message: "อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว" });
};

exports.DeleteUser = async (req, res) => {
  const { u_id } = req.params;
  const sql = "DELETE FROM users WHERE u_id = ?";
  const [result] = await pool.query(sql, [u_id]);
  res.json({ status: true, message: "ลบผู้ใช้เรียบร้อยแล้ว" });
};

exports.UpdateAvatar = async (req, res) => {
  const userId = req.params.u_id;
  const requester = req.user || {};
  const requesterRole = requester.role_name || requester.role;
  if (String(requesterRole).toLowerCase() !== 'admin' && Number(requester.id) !== Number(userId)) {
    return res.status(403).json({ status: false, message: 'ไม่ได้รับอนุญาต' });
  }

  if (!req.file || !req.file.filename) {
    return res.status(400).json({ status: false, message: 'No file uploaded' });
  }

  const avatar = req.file.filename;
  const _now = new Date();
  const _utc = _now.getTime() + _now.getTimezoneOffset() * 60000;
  const _th = new Date(_utc + 7 * 60 * 60 * 1000);
  const date =
    _th.getFullYear() +
    '-' +
    String(_th.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(_th.getDate()).padStart(2, '0') +
    ' ' +
    String(_th.getHours()).padStart(2, '0') +
    ':' +
    String(_th.getMinutes()).padStart(2, '0') +
    ':' +
    String(_th.getSeconds()).padStart(2, '0');

  const sql = 'UPDATE users SET avatar_url = ?, updated_at = ? WHERE u_id = ?';
  const [result] = await pool.query(sql, [avatar, date, userId]);
  res.json({ status: true, message: 'อัปเดตรูปโปรไฟล์เรียบร้อย', avatar_url: avatar });
};
