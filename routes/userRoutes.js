const express = require('express');
const { userRegister, loginUser, logOut, forgotPassword, resetPassword, getUserDetail, updateUserPassword, userUpdate, getallUser, getSingleUser, userDelete, userRoleUpdate } = require('../controllers/userController');
const { isAuthenticate, isAutorize } = require('../middleware/auth');
const router = express.Router();

router.route('/register').post(userRegister);
router.route('/login').post(loginUser);
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').put(resetPassword);

router.route('/me').get(isAuthenticate, getUserDetail);
router.route('/password/update').put(isAuthenticate, updateUserPassword);
router.route('/me/update').put(isAuthenticate, userUpdate);
router.route('/logout').get(logOut);

router.route('/admin/users').get(isAuthenticate, isAutorize('admin'), getallUser);
router.route('/admin/user/:id').get(isAuthenticate, isAutorize('admin'), getSingleUser).put(isAuthenticate, isAutorize('admin'),userRoleUpdate).delete(isAuthenticate, isAutorize('admin'),userDelete);
module.exports = router;