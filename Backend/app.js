const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

const app = express();
dotenv.config();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.json({ status: true, message: 'API is running!' });
});

const authRouter = require('./routes/auth.route');
const usersRouter = require('./routes/users.route');
const productsRouter = require('./routes/products.route');
const ordersRouter = require('./routes/orders.route');
const downloadsRouter = require('./routes/downloads.route');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api', downloadsRouter);



// 404 handler - return JSON message when route not found
app.use((req, res, next) => {
    res.status(404).json({ status: false, message: "ไม่พบหน้านี้" });
});

// Generic error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ status: false, message: err.message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
});

module.exports = app;