const express = require("express");
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const https = require('https');

const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');


const rootDir = require('./util/path');



const mongoose = require('mongoose');

const session = require('express-session');
const mongoDbStore = require('connect-mongodb-session')(session);

const csrf = require('csurf');

const multer = require('multer');

const privateKey = fs.readFileSync('server.key');
const certificate = fs.readFileSync('server.cert');

const fileStorage = multer.diskStorage({
destination: (req,file,cb) =>{
    cb(null,'images');
},
filename: (req,file,cb) =>{
    cb(null, new Date().getTime() + '-' + file.originalname);
}
});

const fileFilter = (req,file,cb) =>{
    if( file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'){
        cb(null,true);
    }else{
        cb(null,false);
    }
}
 

const flash = require('connect-flash');

const app = express();

//const mongoConnect = require('./util/database').mongoConnect;

const MANGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.g4rp5f0.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;

const store = new mongoDbStore({
   uri :  MANGODB_URI,
   collection : 'sessions'
})

 const Product = require('./models/products');
  const User = require('./models/user');
 
// const Cart = require('./models/cart');
// const CartItem = require('./models/cartItem');

const errorController = require('./controllers/error');
const csrfProtection = csrf();



app.set('view engine', 'ejs');
app.set('views', 'views');

const accessLogStream = fs.createWriteStream(path.join(__dirname,'access.log'),{ flags : 'a'});

app.use(helmet());
app.use(compression());
app.use(morgan('combined',{ stream : accessLogStream}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer({storage : fileStorage, fileFilter : fileFilter}).single('image'));



app.use(
    session({secret:'my secret', 
    resave : false ,
     saveUninitialized : false,
    store : store}));

app.use(csrfProtection);
app.use(flash());

app.use((req,res,next)=>{
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})

    app.use((req,res,next)=>{
    if(! req.session.user){
        return next();
    }
        User.findById(req.session.user._id)
        .then(user=>{
            if(!user){
              return  next();
            }
           req.user = user
            next();
        })
        .catch(err=>{
            throw new Error(err);
        }); 
    })
    
const adminroute= require('./routes/admin');
const shoproutes= require('./routes/shop');
const authroutes = require('./routes/auth');



 app.use('/admin',adminroute);
app.use(shoproutes);
app.use(authroutes);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images',express.static(path.join(__dirname, 'images')));

app.use((req,res,next) =>{
    res.status(404).render('404', {pagetitle : 'hiiiiiiii',
    path:'404',
    isAuthenticated : req.session.isLoggedIn});
});



// Product.belongsTo(User,{constraints:true,onDelete:'CASCADE'});
// User.hasMany(Product);
// User.hasOne(Cart);
// Cart.belongsTo(User);
// Cart.belongsToMany(Product,{through : CartItem});
// Product.belongsToMany(Cart,{through : CartItem});

// sequelize.sync()
// .then((result)=>{
//     return User.findByPk(1);})
// .then(user=>{
//     if(!user){
//         return User.create({name:'ganesh',email:'abc@gmail.com'});
//     }
//     return user
// })
// .then(([user,cart])=>{
//     if(cart){
//     return user.createCart();
//     }
// })
// .then(cart=>{
//     app.listen(3000);

// })
// .catch(err=>console.log(err));

mongoose.connect(MANGODB_URI)
.then(result =>{
   
   console.log('connected');
  app.listen(process.env.PORT || 3000);
})
.catch(err=>console.log(err));