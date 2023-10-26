const express = require('express')
const multer = require('multer')
const path = require('path')
const {isLogin,isLogout} = require('../../middlewares/auth')


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
const controller = require('../../Controllers/userController')
const route = express()

route.set('views', './views/user')

route.get('/',isLogout,controller.loadHome)

route.get('/register',isLogout,controller.loadRegister)

route.post('/register',upload.single('image'),controller.insertUser);
route.get('/otpEnter',controller.loadOtp);
route.post('/validate-otp',controller.verifyOtp);
route.get('/resendOtp',controller.resendOTP);


route.get('/login',isLogout,controller.loadLogin);
route.post('/login',controller.verifyLogin);
route.get('/home',isLogin,controller.loginToHome);

route.get('/productsShop',isLogin,controller.loadProducts);
route.get('/productView',controller.viewProduct)

route.get('/logout',isLogin,controller.userLogout);

module.exports = route;