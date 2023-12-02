const express = require("express");
const {upload}= require('../../configs/multers')
const { isLogin, isLogout } = require("../../middlewares/auth");
const controller = require("../../controllers/userController");
const productController = require("../../controllers/productController");
const addressController = require("../../controllers/addressController");
const cartController = require("../../controllers/cartController");
const orderController = require("../../controllers/orderController");
const wishlistController = require('../../controllers/wishlistController')
const couponController = require('../../controllers/couponController')
const reviewController = require('../../controllers/reviewController')

const route = express();

route.set("views", "./views/user");

// user Routes

// get
route.get("/otpEnter", controller.loadOtp);
route.get("/resendOtp", controller.resendOTP);
route.get("/userDashboard", isLogin, controller.loadDashboard);
route.get("/userProfile", isLogin, controller.loadUserProfile);
route.get("/editProfile", isLogin, controller.loadEditProfile);
route.get("/deactivateUser", isLogin, controller.deactivateUser);
route.get("/changePassword", isLogin, controller.changePassword);
route.get('/wallet',isLogin,controller.loadWallet)

// post

route.post("/editUserProfile", upload.single("image"), controller.editProfile);


// product Routes

route.get("/productsShop", productController.UserLoadProducts);
route.get("/productView", productController.UserViewProduct);

// address Routes
// get routes
route.get("/userAddress", isLogin, addressController.loadAddress);
route.get("/addAddress", isLogin, addressController.loadAddAddress);
route.get("/editAddress", isLogin, addressController.loadEditAddress);
// post routes
route.post("/addAddress", addressController.addAddress);
route.post("/editAddress", addressController.editAddress);
route.post('/setDefaultAddress',addressController.setDefaultAddress)

// cart routes

route.post("/addToCart", isLogin, cartController.addTocart);
route.get("/loadCart", isLogin, cartController.loadCart);
route.put("/updateCart", cartController.updateCartCount);
route.delete("/removeCartItem", cartController.removeFromCart);


// checkout routes

// get
route.get("/checkout", isLogin, orderController.loadCheckout);
route.get("/orderSuccess", isLogin, orderController.loadOrderSuccess);
route.get("/orderHistory", isLogin, orderController.loadOrderHistory);
route.get("/orderDetails", isLogin, orderController.orderDetails);
route.get("/cancelOrder", isLogin, orderController.changeOrderStatus);
route.get('/cancelSingleProduct',isLogin,orderController.changeOrderStatus);
route.get("/returnOrder", isLogin, orderController.changeOrderStatus);
route.get('/orderFailed',isLogin,orderController.orderFailed)

// post
route.post("/postCheckout", orderController.postCheckout);
route.post('/razorpayOrder',orderController.razorpayOrder)
route.post('/applyCoupon',orderController.applyCoupon)

route.get('/coupons',isLogin,couponController.userCouponList)
// wishlistRoutes
route.get('/addTowishlist',isLogin,wishlistController.addToWishlist)
route.get('/wishlist',isLogin,wishlistController.loadWishlist)
route.delete("/removeFromWishlist", wishlistController.removeFromWishlist);

route.post('/postReview',isLogin,reviewController.postReview);





module.exports = route;
