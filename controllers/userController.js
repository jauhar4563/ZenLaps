const User = require("../models/userModel.js");
const { securePassword } = require("../helpers/helper");
const { sendVarifyMail } = require("../services/services");
const bcrypt = require("bcrypt");
const Category = require("../models/categoryModel.js");
const Product = require("../models/productModel");
const Transaction = require("../models/transactionModel");
const Banner = require('../models/bannerModel')

// home load
const loadHome = async (req, res) => {
  try {
    const categoryList = await Category.find({ is_listed: true });
    const productList = await Product.find({ is_listed: true });
    const banner = await Banner.find({isListed:true})
    if (req.session.userData) {
      const userData = req.session.userData;
      res.render("home", {
        User: userData,
        category: categoryList,
        products: productList,
        banner
      });
    } else {
      res.render("home", {
        category: categoryList,
        products: productList,
        banner,
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
      referral = req.query.referralCode;
    
    res.render("registration", { User: null ,referral});
  } catch (error) {
    console.log(error.message);
  }
};

// User Registration

const insertUser = async (req, res) => {
  try {
    const spassword = await securePassword(req.body.password);
    req.session.referralCode = req.body.referralCode || null;
    const referralCode = req.session.referralCode;
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.render("registration", { message: "Email already exists" });
    }
    let referrer;

    if (referralCode) {
        referrer = await User.findOne({ referralCode });

        if (!referrer) {

            res.render('registration', { message: 'Invalid referral code.' });
        }

        if (referrer.referredUsers.includes(req.body.email)) {

            res.render('registration', { message: 'Referral code has already been used by this email.' });
        }
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

//otp Page load

const loadOtp = async (req, res) => {
  try {
    const otpGeneratedTime = req.session.otpGeneratedTime;

    res.render("otp-validation", { otpGeneratedTime });
  } catch (error) {
    console.log(error.message);
  }
};

// otp verification

const verifyOtp = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const user = await User.findById(userId);

    const otpGeneratedTime = req.session.otpGeneratedTime;
    const currentTime = Date.now();

    if (currentTime - otpGeneratedTime > 60 * 1000) {
      res.render("otp-validation", {
        message: "OTP expired",
        otpGeneratedTime,
      });
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
          if (req.session.referralCode) {
            await User.updateOne({ _id: userId }, { walletBalance: 50 });
            const referrer = await User.findOne({ referralCode: req.session.referralCode });
            const user = await User.findOne({ _id: userId });
            referrer.referredUsers.push(user.email);
            referrer.walletBalance += 100;
            await referrer.save();
  
            const referredUserTransaction = new Transaction({
                user: referrer._id,
                amount: 100,
                type: 'credit',
                date: Date.now(),
                paymentMethod: "Wallet Payment" ,
                description: 'Referral Bonus',
            });
            const referrerTransaction = new Transaction({
                user: userId,
                amount: 50,
                type: 'credit',
                date: Date.now(),
                paymentMethod: "Wallet Payment" ,
                description: 'Referral Bonus',
            });
            await referredUserTransaction.save();
            await referrerTransaction.save();
  
  
  
        }
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

// resend otp

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

// verify Login

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

// forgot Password otp send

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

//load reset password page

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

// reset password

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

// User Dashboard

const loadDashboard = async (req, res) => {
  try {
    const id = req.session.user_id;
    const userData = await User.findById(id);
    res.render("userDashboard", { User: userData });
  } catch (error) {
    console.log(error);
  }
};

// User profile Show

const loadUserProfile = async (req, res) => {
  try {
    const id = req.session.user_id;
    const userData = await User.findById(id);
    res.render("profile", { User: userData });
  } catch (error) {
    console.log(error.message);
  }
};

// load profile edit page

const loadEditProfile = async (req, res) => {
  try {
    const id = req.session.user_id;
    const userData = await User.findById(id);
    res.render("profileEdit", { User: userData });
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

// load wallet and wallet transaction history

const loadWallet = async (req, res) => {
  try {
    const id = req.session.user_id;
    const userData = await User.findById(id);
    const transactions = await Transaction.aggregate([
      { $match: { user: userData._id, paymentMethod: "Wallet" } },
      { $sort: { date: -1 } },
    ]);

    res.render("wallet", { User: userData, transactions });
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
  loadDashboard,
  loadUserProfile,
  loadEditProfile,
  editProfile,
  deactivateUser,
  changePassword,
  loadWallet,
};
