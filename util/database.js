const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let db;

const mongoConnect = callback => {
    MongoClient.connect('mongodb+srv://ganeshsk350:ryAljFW5WSlAPuPg@cluster0.g4rp5f0.mongodb.net/shop?retryWrites=true&w=majority')
.then(client=>{
    console.log('connected');
    db = client.db();
    callback();

})
.catch(err=>console.log(err));
}

const getDb = () =>{
    if(db){
        return db
    }
    throw 'database not connected';
}

exports.mongoConnect= mongoConnect;
exports.getDb = getDb;