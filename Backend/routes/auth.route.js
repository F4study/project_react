const express = require('express');
const Router = require('../controllers/auth.ctrl');
const upload = require('../middlewares/upload.js');
const router = express.Router();

router.post('/login', Router.Signin);
router.post('/register', upload.single('file'), Router.Signup);

module.exports = router;