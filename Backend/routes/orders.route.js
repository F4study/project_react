const express = require('express');
const router = express.Router();
const ordersCtrl = require('../controllers/orders.ctrl');
const { auth } = require('../middlewares/auth');

router.post('/create', ordersCtrl.CreateOrder);
router.post('/:id/pay', auth('admin','user'), ordersCtrl.MockPayment);
router.get('/overview', ordersCtrl.GetOverview);
router.get('/stats', auth('admin'), ordersCtrl.GetSalesStats);
router.get('/my-downloads', auth('admin','user'), ordersCtrl.GetMyDownloads);
router.get('/', auth('admin'), ordersCtrl.GetOrders);
router.get('/:id', auth('admin','user'), ordersCtrl.GetOrder);
router.get('/:order_id/tokens', auth('admin'), ordersCtrl.GetDownloadTokensByOrder);

module.exports = router;
