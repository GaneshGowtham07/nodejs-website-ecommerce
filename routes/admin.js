const express = require('express');

const path= require('path');

const rootDir = require('../util/path');

const isAuth = require('../middleware/is-auth');

const {body} = require('express-validator');

const router = express.Router();


const adminRoute = require('../controllers/admin');


 router.post('/prods',isAuth,
 [body('title').isString().isLength({min : 3}),
body('image'),
body('price').isFloat(),
body('description').isLength({min: 5, max : 400})],
 adminRoute.postProduct);

router.use('/add-product', isAuth, adminRoute.getAddProducts);



 router.get('/product',isAuth,adminRoute.getProducts);

 router.get('/edit-product/:productId',isAuth,adminRoute.getEditProducts);

 router.post('/edit-product',isAuth,
 [body('title').isString().isLength({min : 3}),
body('image'),
body('price').isFloat(),
body('description').isLength({min: 5, max : 400})],
adminRoute.postEditProduct);

router.delete('/product/:productId',isAuth,adminRoute.deleteProduct);


module.exports = router;