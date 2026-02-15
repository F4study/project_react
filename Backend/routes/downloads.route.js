const express = require('express');
const router = express.Router();
const downloadsCtrl = require('../controllers/downloads.ctrl');

router.get('/download/:token', downloadsCtrl.DownloadByToken);

module.exports = router;
