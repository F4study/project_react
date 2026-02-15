const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.Signin = async (req, res) => {
  const { username, email, password } = req.body;

  const sql = `SELECT users.*, roles.role_name FROM users 
  LEFT JOIN roles ON users.role_id = roles.role_id 
  WHERE email = ? OR username = ? LIMIT 1`;
  const [rows] = await pool.query(sql, [email, username]);

  if (rows.length === 0) {
    return res.status(404).json({ status: false, message: "ไม่พบผู้ใช้" });
  }
  const user = rows[0];

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(400).json({ status: false, message: "ข้อมูลประจำตัวไม่ถูกต้อง" });
  }

  const token = jwt.sign(
    {
      id: user.u_id,
      email: user.email,
      username: user.username,
      role_id: user.role_id,
      role_name: user.role_name,
      is_approved: user.is_approved,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ 
    status: true, 
    token,
    user: {
      id: user.u_id,
      username: user.username,
      email: user.email,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      role: user.role_name,
      role_id: user.role_id,
      is_approved: user.is_approved,
    }
  });
};

exports.Signup = async (req, res) => {
  // Safely obtain form fields. Support either plain form fields or a JSON string in `data`.
  let data = JSON.parse(req.body.data);

  const { display_name, username, email, password, role } = data;

  // กัน undefined ตั้งแต่ต้น
  if (!password || typeof password !== "string") {
    return res.status(400).json({ status: false, message: "กรุณากรอกรหัสผ่าน (password)" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(data)
  // multer stores uploaded file info on req.file; use .path for saved filename
  const file = req.file.filename;

  console.log("User data:", data);
  
  // For e-book store we only allow normal users via signup
  const role_id = 3; // user
  const is_approved = 1;
  
  // Use Thailand time (UTC+7) and format as "YYYY-MM-DD HH:MM:SS"
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

  const sql =
    "INSERT INTO users (display_name, username, email, password_hash, role_id, avatar_url, is_approved, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const [result] = await pool.query(sql, [
    display_name,
    username,
    email,
    hashedPassword,
    role_id,
    file,
    is_approved,
    date,
    date,
  ]);
  res.status(201).json({ status: true, message: "สร้างผู้ใช้เรียบร้อยแล้ว", userId: result.insertId });
};
