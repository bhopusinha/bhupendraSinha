const express=require('express');
const { isAuthenticate, isAutorize } = require('../middleware/auth');
const { newOrder, getSingleOrders, myOrders, getAllOrders, updateOrder, deleteOrder } = require('../controllers/orderController');
const router=express.Router();

router.route('/order/new').post(isAuthenticate,newOrder);

router.route('/order/:id').get(isAuthenticate,getSingleOrders);
router.route('/orders/me').get(isAuthenticate,myOrders);

router.route('/admin/orders').get(isAuthenticate,isAutorize('admin'),getAllOrders);
router.route('/admin/order/:id').put(isAuthenticate,isAutorize("admin"),updateOrder).delete(isAuthenticate,isAutorize("admin"),deleteOrder);

module.exports=router;