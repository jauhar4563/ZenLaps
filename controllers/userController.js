const User = require('../models/userModel.js')
const {sendVarifyMail,securePassword} = require('../helpers/helper')
const bcrypt = require('bcrypt')
const Category = require('../models/categoryModel.js')
const Product = require('../models/productModel')







// home load

const loadHome = async (req,res)=>{
  try{
    const categoryList = await Category.find();
    const productList = await Product.find();

     res.render('home',{category:categoryList,products:productList,User:null})
   
  }catch(error){
    console.log(error.message)
  }
}


// User Registration

const loadRegister = async(req,res)=>{
    try{
        res.render('registration',{User:null});

    }
    catch(error){
        console.log(error.message)
    }
}


const insertUser = async (req, res) => {
    try {
      const spassword = await securePassword(req.body.password);
  
      if (req.body.password !== req.body.confirmPassword) {
        return res.render('registration', { message: 'Passwords do not match' });
      }
      const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.render('registration', { message: 'Email already exists' });
    }
  
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mno,
        image: req.file.filename,
        password: spassword,
        is_admin: 0,
      });
  
      const userData = await user.save();
      req.session.id2 = userData._id;

      if (userData) {
        sendVarifyMail(req,req.body.name, req.body.email, userData._id);


        res.redirect('/otpEnter');
      } else {
        res.render('registration', {error: 'Your registration has been failed' });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // 

  const loadOtp = async(req,res)=>{
    try{
      const userId = req.session.id2;
      const user = await User.findById(userId);      
      res.render('otp-validation',{User:user})
    }catch(error){
      console.log(error.message)
    }
  }


  const verifyOtp = async (req, res) => {
    try {
      const userId = req.session.id2;
      console.log(userId);
      const otpGeneratedTime = req.session.otpGeneratedTime;
      const currentTime = Date.now();
  
      if (currentTime - otpGeneratedTime > 3 * 60 * 1000) {
        res.render('otp-validation',{message:'OTP expired'});
        return;
      }
  
      const user = await User.findById(userId);
      if (user) {
        if (user.is_verified === 1) {
          res.render('otp-validation',{message:"User Already exist",user:user});
          return;
        }
  
        const firstDigit = req.body.first;
        const secondDigit = req.body.second;
        const thirdDigit = req.body.third;
        const fourthDigit = req.body.fourth;
        const fullOTP = firstDigit + secondDigit + thirdDigit + fourthDigit;
  
        if (fullOTP === req.session.otp) {
          delete req.session.otp;

          user.is_verified = 1;
          await user.save();
          res.render('verified');
        } else {
          res.render('otp-validation',{message:"Invalid otp",User:user});
        }
      } else {
        res.render('otp-validation',{message:"User Not Found"});
      }
    } catch (error) {
      console.log(error.message);
    }
  };


  

const resendOTP = async (req, res) => {
  try {
    const userId = req.session.id2;
    const user = await User.findById(userId);
    if (user) {
      if (user.is_verified === 1) {
        res.render('otp-validation',{ message: "User already exist" });
        return;
      }
      delete req.session.otp;

      sendVarifyMail(req,user.name, user.email, userId);


      res.render('otp-validation',{ message: "OTP has been resent." });
    } else {
      res.render('otp-validation',{ message: "User not found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// user Login

const loadLogin = async (req,res)=>{
    try{
        res.render('login',{User:null});
    }
    catch(error){
        console.log(error.message)
    }
}


const verifyLogin = async(req,res)=>{
  try{
      const email = req.body.email;
      const password = req.body.password;
      const userData = await User.findOne({email:email});
      if(userData){
          const passwordMach = await bcrypt.compare(password,userData.password);
          if(passwordMach){
              if(userData.is_verified === 0){
                  res.render('login',{error:"please varify your mail.",User:null})
              }
              else if(userData.is_blocked == 1){
                res.render('login',{error:"Your Account is suspended",User:null})

              }
              else{
                  req.session.user_id = userData._id;
                  req.session.user = email;
                  res.redirect('/home')
                }
          }else{
              res.render('login',{error:"Email and password is incorrect",User:null})
          }
      }else{
          res.render('login',{error:"Email and password is incorrect",User:null})
      }
  }catch(error){
      console.log(error.message)
  }
}


  const loadProducts = async(req,res)=>{
    try{
      const userData = await User.findById({_id:req.session.user_id})

      const products = await Product.find({});
      const categoryList = await Category.find();

      res.render('productShop',{category:categoryList,products:products,User:userData})
    }catch(error){

    }
  }

// view Product

  const viewProduct = async(req,res)=>{
    try{
      const id = req.query.id;
      const productData = await Product.findById(id);
      const userData = await User.find()
      res.render('productView',{product:productData,User:User,})

    }catch(error){
      console.log(error.message)
    }
  }


// logout

const userLogout = async (req, res) => {
  try {
    req.session.destroy(); // Destroy the user's session
    res.redirect('/');
  } catch (error) {
    console.log(error.message);
  }
};


const loginToHome = async(req,res)=>{
  try{
    const categoryList = await Category.find();
    const productList = await Product.find();

       const userData = await User.findById({_id:req.session.user_id})
       res.render('home',{User:userData,category:categoryList,products:productList})
  }catch(error){
      console.log(error.message);
  }
}




module.exports = {
    loadHome,
    loadLogin,
    loadRegister,
    insertUser,
    loadOtp,
    verifyOtp,
    verifyLogin,
    loginToHome,
    userLogout,
    resendOTP,
    loadProducts,
    viewProduct
}