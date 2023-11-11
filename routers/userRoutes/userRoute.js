const express = require("express");
const multer = require("multer");
const path = require("path");
const { isLogin, isLogout } = require("../../middlewares/auth");
const controller = require("../../controllers/userController");
const productController = require("../../controllers/productController");
const addressController = require("../../controllers/addressController");
const cartController = require("../../controllers/cartController");
const orderController = require("../../controllers/orderController");
const wishlistController = require('../../controllers/wishlistController')

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

// user Routes
// get
route.get("/", isLogout, controller.loadHome);
route.get("/register", isLogout, controller.loadRegister);
route.get("/otpEnter", controller.loadOtp);
route.get("/resendOtp", controller.resendOTP);
route.get("/forgotPassword", isLogout, controller.forgotPassword);
route.get("/renewPassword", controller.loadResetPassword);
route.get("/login", isLogout, controller.loadLogin);
route.get("/home", isLogin, controller.loadHome);
route.get("/userDashboard", isLogin, controller.loadDashboard);
route.get("/userProfile", isLogin, controller.loadUserProfile);
route.get("/editProfile", isLogin, controller.loadEditProfile);
route.get("/deactivateUser", isLogin, controller.deactivateUser);
route.get("/changePassword", isLogin, controller.changePassword);
route.get('/wallet',isLogin,controller.loadWallet)

// post
route.post("/forgotPassword", controller.forgotPasswordOTP);
route.post("/resendOtp", controller.verifyOtp);
route.post("/register", isLogout, controller.insertUser);
route.post("/otpEnter", controller.verifyOtp);
route.post("/login", controller.verifyLogin);
route.post("/editUserProfile", upload.single("image"), controller.editProfile);
route.post("/renewPassword", controller.resetPassword);


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
route.get("/cancelOrder", isLogin, orderController.orderCancel);
route.get("/returnOrder", isLogin, orderController.changeOrderStatus);

// post
route.post("/postCheckout", orderController.postCheckout);


// wishlistRoutes
route.get('/addTowishlist',isLogin,wishlistController.addToWishlist)
route.get('/wishlist',isLogin,wishlistController.loadWishlist)
route.delete("/removeFromWishlist", wishlistController.removeFromWishlist);



route.get("/logout", isLogin, controller.userLogout);

module.exports = route;
