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
  
 
      const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.render('registration', { message: 'Email already exists' });
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
        sendVarifyMail(req,req.body.name, req.body.email);


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
      const userId = req.session.user_id;
      const user = await User.findById(userId);      
      res.render('otp-validation',{User:user})
    }catch(error){
      console.log(error.message)
    }
  }


  const verifyOtp = async (req, res) => {
    try {
      const userId = req.session.user_id;
      const user = await User.findById(userId);

      console.log(userId);
      const otpGeneratedTime = req.session.otpGeneratedTime;
      const currentTime = Date.now();
  
      if (currentTime - otpGeneratedTime > 3 * 60 * 1000) {
        res.render('otp-validation',{message:'OTP expired'});
        return;
      }
  
      if (user) {
        
  
        const firstDigit = req.body.first;
        const secondDigit = req.body.second;
        const thirdDigit = req.body.third;
        const fourthDigit = req.body.fourth;
        const fullOTP = firstDigit + secondDigit + thirdDigit + fourthDigit;
  
        if (fullOTP === req.session.otp) {
          if (user.is_verified !== false) {
              res.redirect('/home');
            
          }
          else{
            delete req.session.otp;

            user.is_verified = 1;
            await user.save();
  
            delete req.session.user_id;
            res.render('verified');
          }
          
        } else {
          res.render('otp-validation',{message:"Invalid otp"});
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
    const userId = req.session.user_id;
    const user = await User.findById(userId);
    if (user) {

      delete req.session.otp;

      sendVarifyMail(req,user.name, user.email);


      res.render('otp-validation',{ message: "OTP has been resent."});
    } else {
      res.render('otp-validation',{ message: "User not found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error"});
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
                sendVarifyMail(req,userData.name, userData.email);
                res.redirect('/otpEnter');

                  // req.session.user_id = userData._id;
                  // req.session.user = email;
                  // res.redirect('/home')
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



const otpLogin = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const user = await User.findById(userId);

    console.log(userId);
    const otpGeneratedTime = req.session.otpGeneratedTime;
    const currentTime = Date.now();

    if (currentTime - otpGeneratedTime > 3 * 60 * 1000) {
      res.render('otp-validation',{message:'OTP expired'});
      return;
    }

    if (user) {

      const firstDigit = req.body.first;
      const secondDigit = req.body.second;
      const thirdDigit = req.body.third;
      const fourthDigit = req.body.fourth;
      const fullOTP = firstDigit + secondDigit + thirdDigit + fourthDigit;

      if (fullOTP === req.session.otp) {
        res.redirect('/home');
      } else {
        res.render('otp-validation',{message:"Invalid otp"});
      }
    } else {
      res.render('otp-validation',{message:"User Not Found"});
    }
  } catch (error) {
    console.log(error.message);
  }
};


 


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
    otpLogin,
    loginToHome,
    userLogout,
    resendOTP,
}