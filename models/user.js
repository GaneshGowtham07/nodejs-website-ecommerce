const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
   
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    resetToken: String,
    resetTokenExpiration : Date,
    cart :{
        items : [{
            productId :{ type : Schema.Types.ObjectId , ref : 'Product',  required : true},
            quantity : { type : Number , required : true}
        }]
    }
})

UserSchema.methods.addToCart = function(product){
    const updatedCartIndex = this.cart.items.findIndex(cp =>{
                return cp.productId.toString() === product._id.toString();
               })
              let newQuantity = 1;
               const upadatedCartItems = [...this.cart.items];
               if(updatedCartIndex>=0){
                newQuantity = this.cart.items[updatedCartIndex].quantity + 1;
                upadatedCartItems[updatedCartIndex].quantity=newQuantity;
               }else{
               upadatedCartItems.push({productId : product._id ,quantity: newQuantity});
               console.log(upadatedCartItems,'boss');
              }
               const updatedCart = { items : upadatedCartItems};
               this.cart = updatedCart;
                return this.save();
        
            }


UserSchema.methods.deleteItemFromCart = function(productId){
    const upadatedCartItems = this.cart.items.filter(items =>{
        return items.productId.toString() !== productId.toString();
    });
    this.cart.items = upadatedCartItems;
    return this.save();


}

UserSchema.methods.clearCart = function(){
    this.cart={ items : []};
    return this.save();
}

module.exports = mongoose.model('User', UserSchema);












// const mongodb = require('mongodb');
// const { getCheckout } = require('../../nodeFirstApp/controllers/shop');
// const getDb = require('../util/database').getDb;

// class User {
//     constructor(userName,email,cart,id){
//         this.name= userName;
//         this.email = email;
//         this.cart = cart;
//         this._id = id;
//     }


//     save(){
//         const db = getDb();
//         return db.collection('users').insertOne(this);
//     }


//     addToCart(product){
//        const db =  getDb();
//        const updatedCartIndex = this.cart.items.findIndex(cp =>{
//         return cp.productId.toString() === product._id.toString();
//        })
//       let newQuantity = 1;
//        const upadatedCartItems = [...this.cart.items];
//        if(updatedCartIndex>=0){
//         newQuantity = this.cart.items[updatedCartIndex].quantity + 1;
//         upadatedCartItems[updatedCartIndex].quantity=newQuantity;
//        }else{
//        upadatedCartItems.push({productId : new mongodb.ObjectId(product._id),quantity: newQuantity});
//        console.log(upadatedCartItems,'boss');
//       }
//        const upadtedCart = { items : upadatedCartItems};
//        console.log(upadtedCart,'ASD');
//        return db.collection('users').updateOne({_id : new mongodb.ObjectId(this._id)},{$set : {cart : upadtedCart}});

//     }

//     getCart(){
//         const db = getDb();
//         const productIds = this.cart.items.map(pd =>{
//             return pd.productId;
//         } );
//         return db.collection('products').find( {_id : { $in : productIds}}).toArray()
//         .then(products=>{
//             console.log(products,"products");
//             return products.map( p =>{
//               return  {...p,
//                quantity : this.cart.items.find( i =>{
//                 return i.productId.toString() === p._id.toString();
//                }).quantity };
//             }
//             );
//         })



//     }
//     addOrder(){
//         const db = getDb();
//         return this.getCart()
//         .then(products=>{
//             const order = {
//                 items : products,
//                 users : {
//                     _id : new mongodb.ObjectId(this._id),
//                     name : this.name

//                 }
//             }
//             return db.collection('orders').insertOne(order);
//            })
//             .then(result =>{
//                 this.cart = {items : []};
//                 return db.collection('users')
//                 .updateOne({_id : new mongodb.ObjectId(this._id)},{$set :{ cart: { items : []}}});
//         })
      
      

//     deleteItemFromCart(prodId){
//         const db = getDb();
//         const upadtedCart = this.cart.items.filter(items =>{
//             return items.productId.toString() !== prodId.toString();
//         });
//         return db.collection('users').updateOne({_id : new mongodb.ObjectId(this._id)},{$set :{ cart: { items : upadtedCart}}});
//     }



//         }
    

//     static findById(userId){
//         const db = getDb();
//         return db.collection('users').findOne({ _id : new mongodb.ObjectId(userId)});
//     }

// }

// module.exports = User ;