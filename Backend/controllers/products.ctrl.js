const pool = require('../db');
const path = require('path');

exports.ListProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const offset = (page - 1) * limit;

  let where = '';
  const params = [];
  if (search) {
    where = 'WHERE name LIKE ? OR description LIKE ?';
    params.push('%' + search + '%', '%'+search+'%');
  }

  const countSql = `SELECT COUNT(*) as total FROM products ${where}`;
  const [countRows] = await pool.query(countSql, params);
  const total = countRows[0].total || 0;

  const sql = `SELECT id, name, description, price, file_path, created_at FROM products ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);
  const [rows] = await pool.query(sql, params);

  res.json({ status: true, data: rows, meta: { total, page, limit } });
};

exports.GetProduct = async (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT id, name, description, price, file_path, created_at FROM products WHERE id = ? LIMIT 1';
  const [rows] = await pool.query(sql, [id]);
  if (rows.length === 0) return res.status(404).json({ status: false, message: 'ไม่พบสินค้า' });
  res.json({ status: true, data: rows[0] });
};

exports.CreateProduct = async (req, res) => {
  const { name, description, price } = req.body;
  const file = req.file ? req.file.filename : null;

  const sql = 'INSERT INTO products (name, description, price, file_path, created_at) VALUES (?, ?, ?, ?, NOW())';
  const [result] = await pool.query(sql, [name, description, price, file ? `uploads/${file}` : null]);
  res.status(201).json({ status: true, message: 'สร้างสินค้าเรียบร้อย', productId: result.insertId });
};

exports.UpdateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;
  const file = req.file ? req.file.filename : null;

  const fields = [];
  const values = [];
  if (name !== undefined) { fields.push('name = ?'); values.push(name); }
  if (description !== undefined) { fields.push('description = ?'); values.push(description); }
  if (price !== undefined) { fields.push('price = ?'); values.push(price); }
  if (file) { fields.push('file_path = ?'); values.push(`uploads/${file}`); }

  if (fields.length === 0) return res.status(400).json({ status: false, message: 'ไม่มีข้อมูลให้แก้ไข' });

  const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
  values.push(id);
  await pool.query(sql, values);
  res.json({ status: true, message: 'อัปเดตสินค้าเรียบร้อย' });
};

exports.DeleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    // fetch product to get file path
    const [rows] = await pool.query('SELECT file_path FROM products WHERE id = ? LIMIT 1', [id]);
    if (rows.length === 0) return res.status(404).json({ status: false, message: 'ไม่พบสินค้า' });
    const filePath = rows[0].file_path;

    // Use transaction to remove dependent rows then product
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query('DELETE FROM download_tokens WHERE product_id = ?', [id]);
      await conn.query('DELETE FROM order_items WHERE product_id = ?', [id]);
      await conn.query('DELETE FROM products WHERE id = ?', [id]);
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    // remove uploaded file from disk if exists (file_path usually like 'uploads/xxx')
    if (filePath) {
      try {
        const fs = require('fs');
        const path = require('path');
        const abs = path.join(__dirname, '..', filePath);
        if (fs.existsSync(abs)) fs.unlinkSync(abs);
      } catch (fsErr) {
        console.warn('Failed to remove product file:', fsErr.message);
      }
    }

    res.json({ status: true, message: 'ลบสินค้าเรียบร้อย' });
  } catch (err) {
    console.error('DeleteProduct error', err);
    res.status(500).json({ status: false, message: 'ลบสินค้าไม่สำเร็จ', error: err.message });
  }
};
