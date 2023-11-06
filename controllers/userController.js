const User = require("../models/userModel.js");
const { sendVarifyMail, securePassword } = require("../helpers/helper");
const bcrypt = require("bcrypt");
const Category = require("../models/categoryModel.js");
const Product = require("../models/productModel");

// home load

const loadHome = async (req, res) => {
  try {
    const categoryList = await Category.find({ is_listed: true });
    const productList = await Product.find({ is_listed: true });
    if (req.session.userData) {
      const userData = req.session.userData;
      res.render("home", {
        User: userData,
        category: categoryList,
        products: productList,
      });
    } else {
      res.render("home", {
        category: categoryList,
        products: productList,
        User: null,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// user Login

const loadLogin = async (req, res) => {
  try {
    res.render("login", { User: null });
  } catch (error) {
    console.log(error.message);
  }
};

// User Registration

const loadRegister = async (req, res) => {
  try {
    res.render("registration", { User: null });
  } catch (error) {
    console.log(error.message);
  }
};

// User Registration

const insertUser = async (req, res) => {
  try {
    const spassword = await securePassword(req.body.password);

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.render("registration", { message: "Email already exists" });
    }

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mno,
      password: spassword,
    });

    const userData = await user.save();
    req.session.user_id = userData._id;

    if (userData) {
      req.session.registerOtpVerify = 1;

      sendVarifyMail(req, req.body.name, req.body.email);

      res.redirect("/otpEnter");
    } else {
      res.render("registration", {
        error: "Your registration has been failed",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//

const loadOtp = async (req, res) => {
  try {
    const otpGeneratedTime = req.session.otpGeneratedTime;

    res.render("otp-validation", { otpGeneratedTime });
  } catch (error) {
    console.log(error.message);
  }
};

const verifyOtp = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const user = await User.findById(userId);

    const otpGeneratedTime = req.session.otpGeneratedTime;
    const currentTime = Date.now();

    if (currentTime - otpGeneratedTime > 3 * 60 * 1000) {
      res.render("otp-validation", { message: "OTP expired" });
      return;
    }

    if (user) {
      const firstDigit = req.body.first;
      const secondDigit = req.body.second;
      const thirdDigit = req.body.third;
      const fourthDigit = req.body.fourth;
      const fullOTP = firstDigit + secondDigit + thirdDigit + fourthDigit;

      if (fullOTP === req.session.otp) {
        if (req.session.loginOtpVerify) {
          delete req.session.otp;
          delete req.session.loginOtpVerify;
          req.session.userData = user;
          res.redirect("/home");
        } else if (req.session.forgotPasswordOtpVerify) {
          delete req.session.otp;
          delete req.session.forgotPasswordOtpVerify;
          res.redirect("/renewPassword");
        } else if (req.session.registerOtpVerify) {
          delete req.session.otp;
          delete req.session.user_id;
          delete req.session.registerOtpVerify;

          user.is_verified = 1;
          await user.save();

          res.render("verified");
        } else {
          res.redirect("/login");
        }
      } else {
        res.render("otp-validation", {
          message: "Invalid otp",
          otpGeneratedTime: otpGeneratedTime,
        });
      }
    } else {
      res.render("otp-validation", {
        message: "User Not Found",
        otpGeneratedTime: otpGeneratedTime,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const resendOTP = async (req, res) => {
  try {
    const otpGeneratedTime = req.session.otpGeneratedTime;
    const userId = req.session.user_id;
    const user = await User.findById(userId);
    if (user) {
      delete req.session.otp;

      sendVarifyMail(req, user.name, user.email);

      res.render("otp-validation", {
        message: "OTP has been resent.",
        otpGeneratedTime: otpGeneratedTime,
      });
    } else {
      res.render("otp-validation", {
        message: "User not found",
        otpGeneratedTime: otpGeneratedTime,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });
    if (userData) {
      const passwordMach = await bcrypt.compare(password, userData.password);
      if (passwordMach) {
        if (userData.is_verified == false) {
          res.render("login", {
            error: "please varify your mail.",
            User: null,
          });
        } else if (userData.is_blocked == 1) {
          res.render("login", {
            error: "Your Account is suspended",
            User: null,
          });
        } else {
          // req.session.userData = userData;
          req.session.user_id = userData._id;
          sendVarifyMail(req, userData.name, userData.email);
          req.session.loginOtpVerify = 1;
          res.redirect("/otpEnter");
        }
      } else {
        res.render("login", {
          error: "Email and password is incorrect",
          User: null,
        });
      }
    } else {
      res.render("login", {
        error: "Email and password is incorrect",
        User: null,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// forgot password

const forgotPassword = async (req, res) => {
  try {
    if (req.session.userData) {
      const userId = req.session.user_id;
      const user = await User.findById(userId);

      res.render("forgotPassword", { User: user });
    } else {
      res.render("forgotPassword", { User: null });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const forgotPasswordOTP = async (req, res) => {
  try {
    const email = req.body.email;
    const userExist = await User.findOne({ email: email });

    if (userExist) {
      req.session.user_id = userExist._id;
      req.session.forgotPasswordOtpVerify = 1;
      sendVarifyMail(req, userExist.name, userExist.email);
      res.redirect("/otpEnter");
    } else {
      res.render("forgotpassword", { message: "Attempt Failed", User: null });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadResetPassword = async (req, res) => {
  try {
    if (req.session.userData) {
      const userId = req.session.user_id;
      const user = await User.findById(userId);

      res.render("reEnterPassword", { User: user });
    } else {
      res.render("reEnterPassword", { User: null });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const resetPassword = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const password = req.body.password;
    const secure_password = await securePassword(password);
    const updatedData = await User.findByIdAndUpdate(
      { _id: user_id },
      { $set: { password: secure_password } }
    );
    if (req.session.userData) {
      res.redirect("/userProfile");
    } else {
      delete req.session.user_id;
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadUserProfile = async (req, res) => {
  try {
    const id = req.session.user_id;
    const userData = await User.findById(id);
    res.render("profile", { User: userData });
  } catch (error) {
    console.log(error.message);
  }
};

// edit profile

const editProfile = async (req, res) => {
  try {
    const id = req.body.user_id;
    const updateData = await User.findById(id);

    if (req.body.name) {
      updateData.name = req.body.name;
    }
    if (req.body.description) {
      updateData.email = req.body.email;
    }
    if (req.body.mobile) {
      updateData.mobile = req.body.mobile;
    }
    if (req.file) {
      updateData.image = req.file.filename;
    }

    await updateData.save();

    res.redirect("/userProfile");
  } catch (error) {
    console.log(error.message);
  }
};

//delete account
const deactivateUser = async (req, res) => {
  try {
    const id = req.query.id;
    await User.deleteOne({ _id: id });
    delete req.session.user_id;
    delete req.session.userData;
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

// chnage Password

const changePassword = async (req, res) => {
  try {
    const userData = req.session.userData;
    sendVarifyMail(req, userData.name, userData.email);
    req.session.forgotPasswordOtpVerify = 1;
    res.redirect("/otpEnter");
  } catch (error) {
    console.log(error.message);
  }
};

// logout

const userLogout = async (req, res) => {
  try {
    delete req.session.user_id;
    delete req.session.userData;
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadHome,
  loadLogin,
  loadRegister,
  insertUser,
  loadOtp,
  verifyOtp,
  verifyLogin,
  userLogout,
  resendOTP,
  forgotPassword,
  forgotPasswordOTP,
  loadResetPassword,
  resetPassword,
  loadUserProfile,
  editProfile,
  deactivateUser,
  changePassword,
};
