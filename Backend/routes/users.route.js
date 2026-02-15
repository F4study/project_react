const express = require('express');
const Router = require('../controllers/users.ctrl');
const {auth} = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const router = express.Router();

router.get('/:u_id', auth("admin"), Router.GetUser);
router.get('/', auth("admin"), Router.GetUser);
// changepassword must be defined before '/:u_id' to avoid being treated as a param
router.put('/changepassword', auth("admin","user"), Router.ChangePassword);
// Avatar upload
router.put('/:u_id/avatar', auth("admin","user"), upload.single('file'), Router.UpdateAvatar);
router.put('/:u_id', auth("admin","user"), Router.UpdateUser);
router.delete('/:u_id', auth("admin"), Router.DeleteUser);

module.exports = router;