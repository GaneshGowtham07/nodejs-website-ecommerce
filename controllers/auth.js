const bcrypt = require('bcryptjs');

const nodemailer = require('nodemailer');

const { validationResult } = require('express-validator');

const crypto = require('crypto');

const User = require('../models/user');
let transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: "323f5a39655ecd",
        pass: "802f5dbdd7598b"
    },
  });

  
console.log('adddd');

exports.getLogin = (req,res,next) =>{
  //  const isLoggedIn= req.get('Cookie').split(';')[0].trim().split('=')[1];
   // console.log(isLoggedIn);
    res.render('auth/login',{
        path:'/login',
        pagetitle : 'login',
       errorMessage : req.flash('error'),
       oldInput : {email: '',password:''}
    });
}


exports.postLogin = (req,res,next) =>{
    const email = req.body.email;
    const password = req.body.password;
    const error = validationResult(req);
    console.log(error.array());
    if(!error.isEmpty()){
        return res.status(422).render('auth/login',{
            pagetitle:'login',
            path:'login',
            isAuthenticated: false,
            errorMessage : 'invalid email or password',
            oldInput: {email: email, password : password}
    })}
    User.findOne({email: email})
    .then(user=>{
        if(!user){
            req.flash('error','invalid email or password');
           
                return res.status(422).render('auth/login',{
                    pagetitle:'login',
                    path:'login',
                    isAuthenticated: false,
                    errorMessage : 'invalid email or password',
                    oldInput: {email: email, password : password}
            })}
        
        bcrypt.compare(password, user.password)
        .then(doMatch=>{
            if(doMatch){
                req.session.isLoggedIn = true;
                req.session.user = user;
                return req.session.save(err=>{
                    console.log(err);
                    res.redirect('/');
                });

                
            }
           
                return res.status(422).render('auth/login',{
                    pagetitle:'login',
                    path:'login',
                    isAuthenticated: false,
                    errorMessage : 'invalid email or password',
                    oldInput: {email: email, password : password}
            })})
        
    
    })
    .catch(err=>console.log(err)); 
}

exports.getSignup = (req,res,next) =>{
res.render('auth/signup',{
    pagetitle:'signup',
    path:'signup',
    isAuthenticated: false,
    errorMessage : req.flash('error'),
    oldInput : {email : '',password: '',confirmPassword:''}

});
}


exports.postSignup = (req,res,next)=>{
    console.log('aaabb');
    const email = req.body.email;
    const password = req.body.password;
    const error = validationResult(req);
    console.log(error.array());
    if(!error.isEmpty()){
        return res.status(422).render('auth/signup',{
            pagetitle:'signup',
            path:'signup',
            isAuthenticated: false,
            errorMessage : error.array()[0].msg,
            oldInput : {email : email, password : password, confirmPassword : req.body.confirmPassword}
    })}
    console.log(password,'password');
    const confirmPassword = req.body.confirmPassword;
    bcrypt.hash(password,12)
        .then(hashedPassword=>{
            console.log(hashedPassword);
            const user = new User({
                email : email,
                password : hashedPassword,
                cart: {items: []}
            })
            return user.save()
    
        })
        .then(result=>{
            console.log(result,'aaaaaaa');
            transporter.sendMail({
                from: 'abc@gmail.com',
                to: 'ganeshsk350@gmail.com',
                subject: 'Hello from Node.js',
                text: 'This is a test email sent from Node.js using Mailtrap!',
              }
            );
            res.redirect('/login');
        })
       
    
    
   

}





exports.postLogout = (req,res,next) =>{

    req.session.destroy(err =>{
        console.log(err);
        res.redirect('/');
    })

}


exports.getReset =(req,res,next)=>{
    res.render('auth/reset',{
        path:'/reset',
        pagetitle : 'reset',
       errorMessage : req.flash('error')
    });

}



exports.postReset = (req,res,next) =>{
    const email = req.body.email;
   
        crypto.randomBytes(32,(err,buffer)=>{
            if(err){
                console.log(err);
                res.redirect('/reset')
            }
            const token = buffer.toString('hex');
            User.findOne({email:email})
            .then(user=>{
                if(!user){
                    req.flash('error','invalid email');
                    return res.redirect('/reset');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
        })
        .then(result=>{
            transporter.sendMail({
                from: 'abc@gmail.com',
                to: 'ganeshsk350@gmail.com',
                subject: 'Hello from Node.js',
                html: `<p> you requested for possword reset</p>
                <p> you can click <a href='http://localhost:3000/reset/${token}'>this<a> link to set a new password</p>`
              }
            );
        })
        .catch(err=>{
            console.log(err);
        })

    })
}

exports.getNewPassword = (req,res,next) =>{
    const token = req.params.token;
    User.findOne({resetToken : token, resetTokenExpiration: {$gt : Date.now()}})
    .then(user=>{
        if(!user){
            req.flash('error','invalid email');
            return res.redirect('/reset');
        }
        res.render('auth/new-password',{
            path:'/new-password',
            pagetitle : 'new-password',
           errorMessage : req.flash('error'),
           userId : user._id.toString(),
           resetToken : token
        });


    })
}

exports.postNewPassword = (req,res,next)=>{
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const token = req.body.resetToken;
    let resetUser;
    User.findOne({resetToken : token, resetTokenExpiration : {$gt : Date.now()},_id : userId})
    .then(user=>{
        resetUser = user;
        return bcrypt.hash(newPassword,12)

})
.then(hashedPassword=>{
    resetUser.password= hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration= undefined;
    return resetUser.save();

})
.then(result=>{
    res.redirect('/login');
})
    .catch(err=>console.log(err))
}