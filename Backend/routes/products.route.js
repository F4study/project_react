const express = require('express');
const router = express.Router();
const productsCtrl = require('../controllers/products.ctrl');
const uploadFile = require('../middlewares/uploadFile');
const { auth } = require('../middlewares/auth');

router.get('/', productsCtrl.ListProducts);
router.get('/:id', productsCtrl.GetProduct);
// Admin routes
router.post('/', auth('admin'), uploadFile.single('file'), productsCtrl.CreateProduct);
router.put('/:id', auth('admin'), uploadFile.single('file'), productsCtrl.UpdateProduct);
router.delete('/:id', auth('admin'), productsCtrl.DeleteProduct);

module.exports = router;
