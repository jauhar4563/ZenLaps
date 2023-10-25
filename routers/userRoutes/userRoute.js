const express = require('express')
const multer = require('multer')
const path = require('path')
const auth = require('../../middlewares/auth')


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

route.get('/',auth.isLogout,controller.loadHome)

route.get('/register',controller.loadRegister)

route.post('/register',upload.single('image'),controller.insertUser);
route.get('/otpEnter',controller.loadOtp);
route.post('/validate-otp',controller.verifyOtp);
route.get('/resendOtp',controller.resendOTP);


route.get('/login',controller.loadLogin);
route.post('/login',controller.verifyLogin);
route.get('/home',controller.loginToHome);

route.get('/productsShop',controller.loadProducts)

route.get('/logout',controller.userLogout);

module.exports = route;