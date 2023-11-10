const express = require("express");
const multer = require("multer");
const path = require("path");
const { isLogin, isLogout } = require("../../middlewares/auth");
const controller = require("../../controllers/userController");
const productController = require("../../controllers/productController");
const addressController = require('../../controllers/addressController');
const cartController = require('../../controllers/cartController');
const orderController = require('../../controllers/orderController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../Public/userImages"));
  },
  filename: (req, file, cb) => {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});
const upload = multer({ storage: storage });

const route = express();

route.set("views", "./views/user");

// userController

route.get("/", isLogout, controller.loadHome);
route.get("/register", isLogout, controller.loadRegister);
route.post("/register", isLogout, controller.insertUser);
route.get("/otpEnter", controller.loadOtp);
route.post("/otpEnter", controller.verifyOtp);
route.get("/resendOtp", controller.resendOTP);
route.post("/resendOtp", controller.verifyOtp);
route.get("/forgotPassword", isLogout, controller.forgotPassword);
route.post("/forgotPassword", controller.forgotPasswordOTP);
route.get("/renewPassword", controller.loadResetPassword);
route.post("/renewPassword", controller.resetPassword);
route.get("/login", isLogout, controller.loadLogin);
route.post("/login", controller.verifyLogin);
route.get("/home", isLogin, controller.loadHome);
route.get("/userProfile", isLogin, controller.loadUserProfile);
route.post("/editUserProfile", upload.single("image"), controller.editProfile);
route.get("/deactivateUser", isLogin, controller.deactivateUser);
route.get("/changePassword", isLogin, controller.changePassword);

// productController get

route.get("/productsShop", productController.UserLoadProducts);
route.get("/productView", productController.UserViewProduct);

// addressController 
// get routes
route.get('/userAddress',isLogin,addressController.loadAddress)
route.get('/addAddress',isLogin,addressController.loadAddAddress)
route.get('/editAddress',isLogin,addressController.loadEditAddress);
// post routes
route.post('/addAddress',addressController.addAddress);
route.post('/editAddress',addressController.editAddress);

route.post('/addToCart',isLogin,cartController.addTocart);
route.get('/loadCart',isLogin,cartController.loadCart)
route.put('/updateCart',cartController.updateCartCount)
route.delete('/removeCartItem', cartController.removeFromCart);

route.get('/checkout',isLogin,orderController.loadCheckout)
route.post('/postCheckout',orderController.postCheckout)
route.get('/orderSuccess',isLogin,orderController.loadOrderSuccess);
route.get('/orderHistory',isLogin,orderController.loadOrderHistory);
route.get('/orderDetails',isLogin,orderController.orderDetails)
route.get('/cancelOrder',isLogin,orderController.orderCancel)
route.get('/returnOrder',isLogin,orderController.changeOrderStatus)


route.get("/logout", isLogin, controller.userLogout);



module.exports = route;
