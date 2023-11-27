const express = require("express");
const {
  uploadFields,
  uploadCategoryImage,
  bannerUpload,
} = require("../../configs/multers.js");
const adminController = require("../../controllers/adminController");
const productController = require("../../controllers/productController");
const categoryController = require("../../controllers/categoryController");
const orderController = require("../../controllers/orderController");
const bannerController = require("../../controllers/bannerController");
const couponController = require("../../controllers/couponController");
const offerController = require("../../controllers/offerController");
const { isLogin, isLogout } = require("../../middlewares/adminAuth");
const route = express();

route.set("views", "./views/admin");

// admin Routes
// get
route.get("/", isLogout, adminController.loadLogin);
route.get("/home", isLogin, adminController.loadHome);
route.get("/logout", isLogin, adminController.logout);
route.get("/userList", isLogin, adminController.userList);
route.get("/blockUser", isLogin, adminController.blockUser);

// post
route.post("/", adminController.verifyLogin);

// category routes
// get
route.get("/categoryAdd", isLogin, categoryController.loadCategory);
route.get("/categoryList", isLogin, categoryController.listCategory);
route.get("/unlistCategory", categoryController.unlistCategory);
route.get("/categoryEdit", isLogin, categoryController.loadCategoryEdit);
// post
route.post(
  "/categoryAdd",
  uploadCategoryImage.single("image"),
  categoryController.insertCategory
);
route.post(
  "/categoryEdit",
  uploadCategoryImage.single("image"),
  categoryController.editCategory
);

// Product routes
// get
route.get("/productAdd", isLogin, productController.LoadProductAdd);
route.get("/productDetails", isLogin, productController.AdminViewProduct);
route.get("/productList", isLogin, productController.productList);
route.get("/unlistProduct", productController.unlistProduct);
route.get("/editProduct", isLogin, productController.editProductLoad);
// post
route.post("/productAdd", uploadFields, productController.addProduct);
route.post("/editProduct", uploadFields, productController.updateProduct);

// Order Routes
route.get("/orderList", isLogin, orderController.listUserOrders);
route.get("/orderDetails", isLogin, orderController.adminOrderDetails);
route.get("/refundOrder", isLogin, orderController.returnOrder);
route.get("/orderstatus", isLogin, orderController.changeOrderStatus);
route.get("/cancelOrder", isLogin, orderController.orderCancel);
route.get("/salesReport", isLogin, orderController.loadSalesReport);
route.get("/transactionList", isLogin, orderController.transactionList);

// Banner Routes

// get
route.get("/bannerAdd", isLogin, bannerController.loadBannerAdd);
route.get("/bannerList", isLogin, bannerController.bannerList);
route.get("/bannerEdit", isLogin, bannerController.loadBannerEdit);
route.get('/blockBanner',isLogin,bannerController.blockBanner)

// post
route.post(
  "/bannerAdd",
  bannerUpload.single("image"),
  bannerController.addBanner
);
route.post(
  "/bannerEdit",
  bannerUpload.single("image"),
  bannerController.bannerEdit
);
// Coupon Routes

// get
route.get("/addCoupon", isLogin, couponController.loadCouponAdd);
route.get("/couponList", isLogin, couponController.couponList);
route.get("/editCoupon", isLogin, couponController.loadEditCoupon);
route.get("/couponUnlist", isLogin, couponController.unlistCoupon);
route.get("/couponDetails", isLogin, couponController.couponDetails);

// post
route.post("/addCoupon", isLogin, couponController.addCoupon);
route.post("/editCoupon", couponController.editCoupon);
// Offer Routes

// get
route.get("/addOffer", isLogin, offerController.loadOfferAdd);
route.get("/offerList", isLogin, offerController.OfferList);
route.get("/offerEdit", isLogin, offerController.loadOfferEdit);
route.get("/blockOffer", isLogin, offerController.offerBlock);

// post
route.post("/addOffer", offerController.addOffer);
route.post("/offerEdit", offerController.editOffer);

module.exports = route;
