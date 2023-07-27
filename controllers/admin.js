const Product = require('../models/products');

const fileHandler = require('../util/file');

const {validationResult} = require('express-validator');

exports.getAddProducts = (req,res,next)=>{
    res.render('admin/edit-product',{path:'admin/add-product',
     pagetitle:'add product',
     edit:false,
     hasError: false,
     errorMessage: null,
    isAuthenticated : req.session.isLoggedIn})};



exports.postProduct = (req,res,next)=>{
    
    const title= req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.render('admin/edit-product',
        {path:'admin/add-product',
        pagetitle:'add product',
       edit: false,
       hasError: true,
       errorMessage: error.array()[0].msg,
   product:{
    title : title,
    price : price,
    description : description
   },
   isAuthenticated : req.session.isLoggedIn});
       
    }
    
    const imageUrl = image.path;
    const product = new Product(
        {
        title : title,
        price : price,
        description : description,
        imageUrl : imageUrl,
        userId : req.session.user,
        isAuthenticated : req.session.isLoggedIn
        
        });
    product.save()
    .then((result)=>{
    
        res.redirect('/');})
    .catch(err=>console.log(err));
  
    
};

exports.getEditProducts = (req,res,next)=>{
    console.log('dddddddddddddd');
    const editMode = req.query.edit;
    const productId = req.params.productId;

    Product.findById(productId)
    .then(product=>{
        if(!editMode){
            return res.redirect('/');
        }
        res.render('admin/edit-product',{path:'admin/edit-product',
         pagetitle:'edit product',
        edit: editMode,
    product:product,
    hasError: false,
    errorMessage: null,
    isAuthenticated : req.session.isLoggedIn});
        
    })
    .catch(err=>console.log(err));
  
};

exports.postEditProduct = (req,res,next) => { 

    
    const updatedId = req.body.productId;
    const updatedTitle= req.body.title;
    const image = req.file;                
    const updatedPrice = req.body.price;       
    const updatedDescription = req.body.description;
    if(!image){
        return res.render('admin/edit-product',
        {path:'admin/edit-product',
        pagetitle:'edit product',
       edit: true,
       hasError: true,
       errorMessage: 'invalid image',
   product:{
    title : updatedTitle,
    price : updatedPrice,
    description : updatedDescription,
    _id : updatedId
   },
   isAuthenticated : req.session.isLoggedIn});
       
    }
    
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.render('admin/edit-product',
        {path:'admin/edit-product',
        pagetitle:'edit product',
       edit: true,
       hasError: true,
       errorMessage: error.array()[0].msg,
   product:{
    title : updatedTitle,
    price : updatedPrice,
    description : updatedDescription,
    _id : updatedId
   },
   isAuthenticated : req.session.isLoggedIn});
       
    }

    Product.findById(updatedId)
    .then(product=>{
        if(product.userId.toString() !== req.user._id.toString()){
            return res.redirect('/');
        }
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDescription;
        if(image){
            fileHandler.filedelete(product.imageUrl);
            product.imageUrl = image.path;
        }

        product.userId = req.user;
        return product.save()
        .then(result=>{
            console.log(result);
            res.redirect('/admin/product');
    })
  
   })
   .catch(err=>console.log(err));

    
}

exports.deleteProduct = (req,res,next) =>{
    console.log('hiiiiiiiiiiii');
    const productId = req.params.productId;
    console.log(productId,'productId');
    Product.findById(productId)
    .then(prod=>{
        if(!prod){
            throw new Error('product not found')
        }
        fileHandler.filedelete(prod.imageUrl);
        return Product.deleteOne({_id : productId, userId : req.user._id})
    })
   
   .then(()=>{

    res.status(200).json({message : 'successfully deleted'});

   })
   .catch(err=>{
    res.status(500).json({message: 'product not found'});
    });
    

}



exports.getProducts = (req,res,next)=>{
    Product.find({userId : req.user._id})
    .then(products=>
       { res.render('admin/product', {prods : products,
            pagetitle:'product-list' ,
         hasProduct : products.length>0
            , path: 'admin/product',
            isAuthenticated : req.session.isLoggedIn});
    })
    .catch(err=>console.log(err));
   };

