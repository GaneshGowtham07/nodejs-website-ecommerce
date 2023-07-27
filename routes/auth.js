const express = require('express');
const { RouterProvider } = require('react-router-dom');

const {check,body} = require('express-validator');

const User = require('../models/user');

const router = express.Router();

const authController = require('../controllers/auth');

router.get('/login', authController.getLogin);

router.post('/login',
[check('email','please enter a valid email').isEmail().normalizeEmail(),
check('password','please enter a valid password')
.isLength({min : 6}).isAlphanumeric().trim()],authController.postLogin );

router.get('/signup',authController.getSignup);

router.post('/signup',
[check('email').isEmail().withMessage('please enter valid email id').normalizeEmail()
.custom((value,{req})=>{
    return User.findOne({email: value})
    .then(user=>{
        if(user){
            return Promise.reject('This email is already present, please pick a different email')
        }
    })
})
,
body('password','please a enter a valid password with only numbers and alphabets and minimum length of 6 characters')
.isLength({min : 6 }).isAlphanumeric().trim(),
body('confirmPassword').trim().
custom((value,{req})=>{
if(value !== req.body.password){
    throw new Error('password do not match');
}
return true;
})],
authController.postSignup);


router.post('/logout',authController.postLogout);

router.get('/reset',authController.getReset);

router.post('/reset',authController.postReset);

router.get('/reset/:token',authController.getNewPassword);

router.post('/new-password',authController.postNewPassword);

module.exports = router;