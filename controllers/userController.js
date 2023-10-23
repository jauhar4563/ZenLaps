const User = require('../models/userModel.js')
const {sendVarifyMail,securePassword} = require('../helpers/helper')
const bcrypt = require('bcrypt')

const OTP_RESEND_LIMIT = 3; // Number of allowed OTP resend attempts
const OTP_RESEND_INTERVAL = 30000; // 30 seconds in milliseconds






// home load

const loadHome = async (req,res)=>{
  try{
    res.render('home',{User:null})
  }catch(error){
    console.log(error.message)
  }
}


// User Registration

const loadRegister = async(req,res)=>{
    try{
        res.render('registration');

    }
    catch(error){
        console.log(error.message)
    }
}


const insertUser = async (req, res) => {
    try {
      const spassword = await securePassword(req.body.password);
  
      // Check if the password and confirmPassword fields match
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
      // Handle other errors here
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
        // OTP has expired
        res.render('otp-validation',{message:'OTP expired'});
        return;
      }
  
      // Check if the user is already verified in the database
      const user = await User.findById(userId);
      if (user) {
        if (user.is_verified === 1) {
          res.render('otp-validation',{message:"User Already exist"});
          return;
        }
  
        // Continue with OTP verification
        const firstDigit = req.body.first;
        const secondDigit = req.body.second;
        const thirdDigit = req.body.third;
        const fourthDigit = req.body.fourth;
        const fullOTP = firstDigit + secondDigit + thirdDigit + fourthDigit;
  
        if (fullOTP === req.session.otp) {
          // Set user as verified in the database
          delete req.session.otp;

          user.is_verified = 1;
          await user.save();
          res.render('verified');
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


  
// resend otp


// const resendOTP = async (req, res) => {
//   try {
//     const userId = req.session.id2;
//     const user = await User.findById(userId);
//     if (user) {
//       if (user.is_verified === 1) {
//         res.render('otp-validation',{ message: "User already exist" });
//         return;
//       }
//       delete req.session.otp;

//       sendVarifyMail(req,user.name, user.email, userId);


//       res.render('otp-validation',{ message: "OTP has been resent." });
//     } else {
//       res.render('otp-validation',{ message: "User not found" });
//     }
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };



const resendOTP = async (req, res) => {
  try {
    const userId = req.session.id2;
    const otpGeneratedTime = req.session.otpGeneratedTime;
    const otpResendAttempts = req.session.otpResendAttempts || 0;
    const currentTime = Date.now();

    // Check if the OTP can be resent
    if (
      currentTime - otpGeneratedTime < OTP_RESEND_INTERVAL &&
      otpResendAttempts >= OTP_RESEND_LIMIT
    ) {
      res.render('otp-validation', { message: 'You can resend after 30 seconds' });
      return;
    }

    // Generate and send a new OTP
    sendVarifyMail(req, user.name, user.email, userId);

    // Update the session with the new OTP and timestamp
    req.session.otpGeneratedTime = currentTime;
    req.session.otpResendAttempts = (otpResendAttempts || 0) + 1;

    res.render('otp-validation', { message: 'OTP has been resent' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// user Login

const loadLogin = async (req,res)=>{
    try{
        res.render('login');
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
                  res.render('login',{message:"please varify your mail."})
              }
              else{
                  req.session.user_id = userData._id;
                  res.redirect('/home')
                }
          }else{
              res.render('login',{message:"Email and password is incorrect"})
          }
      }else{
          res.render('login',{message:"Email and password is incorrect"})
      }
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
       const userData = await User.findById({_id:req.session.user_id})
       res.render('home',{User:userData})
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
    resendOTP
}