const { getAllproduct, createProduct, updateProduct, deleteProduct, getproductDetails, createProductReview, getAllReviews, deleteProductReviews, getAdminProducts } = require('../controllers/productController');
const { isAuthenticate, isAutorize } = require('../middleware/auth');

const router=require('express').Router();


router.route('/product').get(getAllproduct);
router.route('/admin/product/new').post( isAuthenticate,isAutorize("admin"),createProduct);
router.route('/admin/product/:id').put( isAuthenticate,isAutorize("admin"),updateProduct).delete( isAuthenticate,isAutorize("admin"),deleteProduct);
router.route('/admin/products').get( isAuthenticate,isAutorize("admin"),getAdminProducts);
router.route('/product/:id').get(getproductDetails);

router.route('/review').put(isAuthenticate,createProductReview);
router.route('/reviews').get(getAllReviews).delete(isAuthenticate,deleteProductReviews);
module.exports=router;