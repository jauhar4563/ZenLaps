const User = require('../models/userModel.js')
const {sendVarifyMail,securePassword} = require('../helpers/helper')
const bcrypt = require('bcrypt')
const Category = require('../models/categoryModel.js')
const Product = require('../models/productModel')


// home load

const loadHome = async (req,res)=>{
  try{
    const categoryList = await Category.find({is_listed:true});
    const productList = await Product.find({is_listed:true});
if(req.session.user_id){
    const userData = req.session.userData;
  res.render('home',{User:userData,category:categoryList,products:productList})
}else{
  res.render('home',{category:categoryList,products:productList,User:null})

}
   
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
        req.session.verificationPurpose = 'Registration';

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
      const otpGeneratedTime = req.session.otpGeneratedTime;

      res.render('otp-validation',{otpGeneratedTime})
    }catch(error){
      console.log(error.message)
    }
  }


  const verifyOtp = async (req, res) => {
    try {
      const verificationPurpose = req.session.verificationPurpose || 'default'; // You can set a default value other than 'default' if needed
      const userId = req.session.user_id;
      const user = await User.findById(userId);

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
          delete req.session.otp;
          if (verificationPurpose == 'login') {
            req.session.userData = user;
              res.redirect('/home');
            
          }else if (verificationPurpose == 'forgotPassword') {
           
            delete req.session.verificationPurpose;
            res.redirect('/renewPassword');
          }
          else if(verificationPurpose == 'Registration'){
            delete req.session.user_id;
            delete req.session.verificationPurpose;

            user.is_verified = 1;
            await user.save();
  
            res.render('verified');
          }
          else{
            res.redirect('/login');
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
                // req.session.userData = userData;
                req.session.user_id = userData._id;
                sendVarifyMail(req,userData.name, userData.email);
                req.session.verificationPurpose = 'login';
                res.redirect('/otpEnter');
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




// forgot password

const forgotPassword = async(req,res)=>{

  try {
      
    
   res.render('forgotPassword',{User:null})
   
  } catch (error) {

   console.log(error.message);
   
  }



}



const forgotPasswordOTP = async (req, res) => {
  try {
    const email = req.body.email;
      const userExist = await User.findOne({ email: email });
      
      if (userExist) {
          req.session.user_id = userExist._id;
          req.session.verificationPurpose = 'forgotPassword';         
          sendVarifyMail(req, userExist.name, userExist.email);
          res.redirect('/otpEnter');
      } else {
              res.render('forgotpassword', { message: "Attempt Failed",User:null });
          
      }
  } catch (error) {
      console.log(error.message);
  }
}

const loadResetPassword = async (req,res)=>{
  try{
    res.render('reEnterPassword',{User:null})
  }catch(error){
    console.log(error.message);
  }
}


const resetPassword = async(req,res)=>{
  try {
      const user_id = req.session.user_id; 
      const password = req.body.password;
      const secure_password = await securePassword(password);
      const updatedData= await User.findByIdAndUpdate({_id:user_id},{$set:{password:secure_password}});
      delete req.session.user_id;
      res.redirect('/login');

      
  } catch (error) {
    console.log(error.message);
  }
}
 

const loadUserProfile = async(req,res)=>{
  try{
    const userData = req.session.userData;
    res.render('profile',{User:userData})
  }catch(error){
    console.log(error.message)
  }
}


// logout

const userLogout = async (req, res) => {
  try {

    req.session.destroy(); 
    res.redirect('/');
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
    loadUserProfile
}