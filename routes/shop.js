const express = require('express');

const path = require('path');

const rootDir = require('../util/path');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

const adminroutedata = require('./admin');

const shopRoute = require('../controllers/shop');

router.get('/', shopRoute.getIndex);

 router.get('/product',shopRoute.getProducts);

 router.post('/cart',isAuth,shopRoute.postCart);

  router.get('/cart',isAuth,shopRoute.getCart);

  router.post('/delete-cart-item',isAuth,shopRoute.deleteItemFromCart);

router.get('/product/:productId', shopRoute.getProduct);

router.get('/checkout',isAuth,shopRoute.getCheckout);

router.get('/orders',isAuth,shopRoute.getOrders);

router.post('/orders', isAuth,shopRoute.postOrder);

router.get('/orders/:orderId', isAuth, shopRoute.getInvoice);


module.exports = router;

