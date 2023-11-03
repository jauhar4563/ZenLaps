const express = require('express')
const multer = require('multer')
const path = require('path')
const {isLogin,isLogout} = require('../../middlewares/auth');
const controller = require('../../controllers/userController');
const productController = require('../../controllers/productController')

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,path.join(__dirname,'../../Public/userImages'));
    },
    filename:(req,file,cb)=>{
        const name = Date.now()+'-'+file.originalname;
        cb(null,name);
    } 
})
const upload = multer({storage:storage})
// const app = express();
const route = express()

route.set('views', './views/user')

route.get('/',isLogout,controller.loadHome)

route.get('/register',isLogout,controller.loadRegister)

route.post('/register',isLogout,controller.insertUser);
route.get('/otpEnter',isLogout,controller.loadOtp);
route.post('/otpEnter',controller.verifyOtp);
route.get('/resendOtp',controller.resendOTP);
route.post('/resendOtp',controller.verifyOtp)

route.get('/forgotPassword',isLogout,controller.forgotPassword);
route.post('/forgotPassword',controller.forgotPasswordOTP);
route.get('/renewPassword',controller.loadResetPassword)
route.post('/renewPassword',controller.resetPassword);
route.get('/login',isLogout,controller.loadLogin);
route.post('/login',controller.verifyLogin);
route.get('/home',isLogin,controller.loadHome);
route.get('/productsShop',productController.UserLoadProducts);
route.get('/productView',productController.UserViewProduct)
route.get('/userProfile',isLogin,controller.loadUserProfile)
route.post('/editUserProfile',upload.single('image'),controller.editProfile)

route.get('/logout',isLogin,controller.userLogout);



module.exports = route;