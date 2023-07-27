const Product = require('../models/products');

const math = require('mathjs');

const fs = require('fs');
const path = require('path');
// // const Cart = require('../models/cart');
const User = require('../models/user');
// // const CartItem = require('../models/cartItem');

const Order = require('../models/order');

const pdfDocument = require('pdfkit');

const itemsPerPage = 1;





exports.getProducts = (req,res,next)=>{
    const page = +req.query.page || 1;
    
    let totalCount;
    Product.find().countDocuments()
    .then(totalItems=>{
        totalCount = totalItems;
        return   Product.find()
        .skip((page - 1) * itemsPerPage)
        .limit(itemsPerPage)

    })
  
    .then((products)=>{
        res.render('shop/product-list', {prods : products,
            pagetitle:'product-list' ,
            doctitle : 'shopjjj' , hasProduct : products.length>0
            , path: '/product',
            currentPage: page,
            hasNextPage : page * itemsPerPage < totalCount,
            hasPreviousPage : page >1,
            nextPage : page + 1,
            previousPage : page-1,
            lastPage : math.ceil(totalCount/itemsPerPage)
            
    })})
    .catch(err=>console.log(err));
      
}
        

    
    exports.getIndex = (req,res,next)=>{
        const page = +req.query.page || 1;
        
        let totalCount;
        Product.find().countDocuments()
        .then(totalItems=>{
            totalCount = totalItems;
            return   Product.find()
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage)

        })
      
        .then((products)=>{
            res.render('shop/index.ejs', {prods : products,
                pagetitle:'shop' ,
                doctitle : 'shopjjj' , hasProduct : products.length>0
                , path: '/',
                currentPage: page,
                hasNextPage : page * itemsPerPage < totalCount,
                hasPreviousPage : page >1,
                nextPage : page + 1,
                previousPage : page-1,
                lastPage : math.ceil(totalCount/itemsPerPage)
                
        })})
        .catch(err=>console.log(err));
          
       };

    exports.getCart =  (req,res,next) => {
     req.user.populate('cart.items.productId')
        //.execPopulate()
            .then(user =>{
                const products = user.cart.items;
                console.log(products,"getCart");
                res.render('shop/cart',{
                    pagetitle:'cart',
                    path: '/cart',
                    product: products,
                    isAuthenticated : req.session.isLoggedIn

            });
        })
            .catch(err=>console.log(err));
        
               
            
            };
        

    exports.postCart = (req,res,next) => {
        console.log('dfasaaadsf');
        const postId = req.body.productId;
        return Product.findById(postId)
        .then(product =>{
            return req.user.addToCart(product)
        })
        .then(result=>{
            console.log(result,'hiii');
            res.redirect('/cart');
        })
        .catch(err=>console.log(err));

    };

exports.deleteItemFromCart = (req,res,next) =>{
    const prodId = req.body.productId;
    req.user.deleteItemFromCart(prodId)
    .then(result=>{
        console.log(result);
        res.redirect('/cart');
    }).
    catch(err=>console.log(err));

}

//     //     let fetchedCart;
//     //    req.user.getCart()
//     //    .then(cart=>{
//     //     fetchedCart = cart;
//     //     return cart.getProducts({where : { id : postId}});
//     //    })
//     //     .then(products=>{
//     //         let product;
//     //         if(products.length>0){
//     //             product=products[0];
//     //         }
//     //         let newQuantity = 1 ;
//     //         if(product){

//     //         }
//     //         return Product.findByPk(postId)
//     //         .then(product=>{
//     //             return fetchedCart.addProduct(product,{ through : {quantity : newQuantity}});

//     //         })
//     //         .catch(err=>console.log(err));
           
//     //     })
//     //     .then(()=>{
//     //        
//     //     })
//     //     .catch(err=>console.log(err));

exports.getCheckout = (req,res,next) => {
    req.user.populate('cart.items.productId')
    //.execPopulate()
        .then(user =>{
            const products = user.cart.items;
            let total=0;
            products.forEach(product=>{
                total+= product.quantity * product.productId.price;
            })

            console.log(products,"getCart");
            res.render('shop/checkout',{
                pagetitle:'checkout',
                path: '/checkout',
                product: products,
                isAuthenticated : req.session.isLoggedIn,
                totalPrice: total


        });
    })
        .catch(err=>console.log(err));
    
           
        
        };
    
    exports.postOrder = async (req,res,next) =>{
        await req.user.populate('cart.items.productId')
            .then(user =>{
                const product = user.cart.items.map(i=>{
                    return {quantity : i.quantity, product : { ...i.productId._doc}};
                });
                console.log(product,"orderProduct");
                const order = new Order({
                    user : {
                        email : req.session.user.email,
                        userId : req.session.user
                    },
                    products : product
                })
                console.log(order,'order');
               return order.save();
            })
        .then(()=>{
            req.user.clearCart();
        })
        .then(()=>{
            res.redirect('/orders')
        })
    }   
  

    exports.getOrders = (req,res,next) =>{
        return Order.find({'user.userId' : req.user._id}).then( order =>{
            res.render('shop/orders',{
                pagetitle:'Orders',
                path: '/orders',
                orders: order,
                isAuthenticated : req.session.isLoggedIn
        })
      
    });
    }

    exports.getProduct = (req,res,next) =>{
        const productId = req.params.productId;
        console.log(productId);
        Product.findById(productId)
        .then((product) =>{
            
            res.render('shop/product-detail',{product : product,
                path:'/product', 
                pagetitle: product.title,
                isAuthenticated : req.session.isLoggedIn});
        })
        .catch(err=>console.log(err));
        
    }



exports.getInvoice = (req,res,next) =>{
    const orderId = req.params.orderId;
    console.log(orderId,'orderId');
    Order.findById(orderId)
    .then(order=>{
        if(!order){
            throw new Error('order not present');
        }
        if( order.user.userId.toString() !== req.user._id.toString()){
            throw new Error('invalid order');
        }
         const invoiceName = 'invoice-' + orderId + '.pdf';
         const filePath = path.join('data','invoices',invoiceName);
         res.setHeader('Content-Type','application/pdf');
         res.setHeader('Content-Disposition', 'inline; filename="'+ invoiceName + '"');
        const pdfDoc = new pdfDocument();

        pdfDoc.pipe(fs.createWriteStream(filePath));
        pdfDoc.pipe(res);

        pdfDoc.fontSize(26).text('Invoice',{
            underline: true
        });

        pdfDoc.text('-----------------------------------');
        let totalPrice = 0;
        order.products.forEach(prods =>{
            totalPrice = totalPrice + prods.quantity * prods.product.price;
            pdfDoc.fontSize(16).text( prods.product.title + '-' + prods.quantity + ' x ' + '$' + prods.product.price);
        })
        pdfDoc.text('------------------------------------');
        pdfDoc.fontSize(26).text('$' + totalPrice);

        pdfDoc.end()
    })
    .catch(err=>{
        throw new Error('invalid order')
    })
}

    //     fs.readFile(filePath, (err,data)=>{
    //         if(err){
    //             return console.log(err);
    //         }
    //         res.setHeader('Content-Type','application/pdf');
    //         res.setHeader('Content-Disposition', 'inline; filename="'+ invoiceName + '"');
    //         res.send(data);
    // })
   
    // })
    // .catch(err=>{
    //     throw new Error('no order present');
    // })
//     const file = fs.createReadStream(filePath);
//     res.setHeader('Content-Type','application/pdf');
//      res.setHeader('Content-Disposition', 'inline; filename="'+ invoiceName + '"');
//      file.pipe(res);
// };

//     // 
       