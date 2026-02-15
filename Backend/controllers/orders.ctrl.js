const pool = require('../db');
const crypto = require('crypto');

// helper to add hours
function addHours(date, h) {
  return new Date(date.getTime() + h * 60 * 60 * 1000);
}

exports.CreateOrder = async (req, res) => {
  const { customer_name, customer_email, items } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ status: false, message: 'ไม่มีสินค้าในคำสั่งซื้อ' });
  }

  // Calculate total_price
  let total = 0;
  for (const it of items) {
    total += parseFloat(it.price || 0) * (it.qty || 1);
  }

  // insert order as pending (payment required)
  const [orderRes] = await pool.query(
    'INSERT INTO orders (customer_name, customer_email, total_price, status, created_at) VALUES (?, ?, ?, ?, NOW())',
    [customer_name, customer_email, total, 'pending']
  );
  const orderId = orderRes.insertId;

  // insert order_items (tokens will be created after payment)
  for (const it of items) {
    const productId = it.product_id;
    const price = it.price;
    await pool.query('INSERT INTO order_items (order_id, product_id, price) VALUES (?, ?, ?)', [orderId, productId, price]);
  }

  res.status(201).json({ status: true, orderId, message: 'คำสั่งซื้อถูกสร้าง (รอชำระเงิน)' });
};

// Mock payment: mark order paid and generate download tokens
exports.MockPayment = async (req, res) => {
  const { id } = req.params;
  // validate order exists and is pending
  const [orders] = await pool.query('SELECT * FROM orders WHERE id = ? LIMIT 1', [id]);
  if (orders.length === 0) return res.status(404).json({ status: false, message: 'ไม่พบคำสั่งซื้อ' });
  const order = orders[0];
  if (String(order.status).toLowerCase() === 'paid') {
    return res.status(400).json({ status: false, message: 'คำสั่งซื้อถูกชำระแล้ว' });
  }

  // get items
  const [items] = await pool.query('SELECT oi.*, p.file_path FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?', [id]);
  if (!items || items.length === 0) return res.status(400).json({ status: false, message: 'คำสั่งซื้อไม่มีสินค้า' });

  // generate tokens
  const downloadTokens = [];
  for (const it of items) {
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = addHours(new Date(), 24); // 24 hours
    await pool.query('INSERT INTO download_tokens (token, order_id, product_id, expires_at, created_at) VALUES (?, ?, ?, ?, NOW())', [token, id, it.product_id, expiresAt]);
    downloadTokens.push({ product_id: it.product_id, token, expires_at: expiresAt, file_path: it.file_path });
  }

  // mark order paid
  await pool.query('UPDATE orders SET status = ? WHERE id = ?', ['paid', id]);

  res.json({ status: true, orderId: id, downloadTokens });
};

exports.GetOrders = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
  res.json({ status: true, data: rows });
};

exports.GetSalesStats = async (req, res) => {
  // simple sales per day for paid orders
  const sql = `SELECT DATE(created_at) as day, SUM(total_price) as total_sales, COUNT(*) as orders_count
    FROM orders WHERE status = 'paid' GROUP BY DATE(created_at) ORDER BY DATE(created_at) DESC LIMIT 30`;
  const [rows] = await pool.query(sql);
  res.json({ status: true, data: rows });
};

exports.GetOverview = async (req, res) => {
  try {
    const [[{ total_sales = 0 }]] = await pool.query("SELECT IFNULL(SUM(total_price),0) as total_sales FROM orders WHERE status = 'paid'");
    const [[{ total_orders = 0 }]] = await pool.query("SELECT COUNT(*) as total_orders FROM orders WHERE status = 'paid'");
    const [[{ total_users = 0 }]] = await pool.query("SELECT COUNT(*) as total_users FROM users");
    res.json({ status: true, data: { total_sales, total_orders, total_users } });
  } catch (err) {
    console.error('GetOverview error', err);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};

exports.GetOrder = async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query('SELECT * FROM orders WHERE id = ? LIMIT 1', [id]);
  if (rows.length === 0) return res.status(404).json({ status: false, message: 'ไม่พบคำสั่งซื้อ' });
  const order = rows[0];
  const [items] = await pool.query('SELECT oi.*, p.name, p.file_path FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?', [id]);
  res.json({ status: true, data: { order, items } });
};

exports.GetDownloadTokensByOrder = async (req, res) => {
  const { order_id } = req.params;
  const [rows] = await pool.query('SELECT token, product_id, expires_at FROM download_tokens WHERE order_id = ?', [order_id]);
  res.json({ status: true, data: rows });
};

// Get downloads for the logged-in user (matched by order.customer_email)
exports.GetMyDownloads = async (req, res) => {
  // require authenticated user (email present in token)
  const userEmail = req.user?.email;
  if (!userEmail) return res.status(401).json({ status: false, message: 'ไม่มีสิทธิ์' });

  const sql = `SELECT dt.token, dt.expires_at, p.id as product_id, p.name as product_name, p.file_path
    FROM download_tokens dt
    LEFT JOIN orders o ON dt.order_id = o.id
    LEFT JOIN products p ON dt.product_id = p.id
    WHERE o.customer_email = ?
    ORDER BY dt.created_at DESC LIMIT 20`;
  const [rows] = await pool.query(sql, [userEmail]);
  res.json({ status: true, data: rows });
};
