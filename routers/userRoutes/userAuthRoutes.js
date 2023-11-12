const express = require("express");
const { isLogin, isLogout } = require("../../middlewares/auth");
const controller = require("../../controllers/userController");
const route = express()
const nocache = require("nocache")

route.use(nocache())

route.set("views", "./views/user");

// get routes

route.get("/", isLogout, controller.loadHome);
route.get("/register", isLogout, controller.loadRegister);
route.get("/otpEnter", controller.loadOtp);
route.get("/resendOtp", controller.resendOTP);
route.get("/forgotPassword", isLogout, controller.forgotPassword);
route.get("/renewPassword", controller.loadResetPassword);
route.get("/login", isLogout, controller.loadLogin);
route.get("/home", isLogin, controller.loadHome);
route.get("/changePassword", isLogin, controller.changePassword);

route.get("/logout", isLogin, controller.userLogout);

// post routes

route.post("/forgotPassword", controller.forgotPasswordOTP);
route.post("/resendOtp", controller.verifyOtp);
route.post("/register", isLogout, controller.insertUser);
route.post("/otpEnter", controller.verifyOtp);
route.post("/login", controller.verifyLogin);
route.post("/renewPassword", controller.resetPassword);

module.exports = route