const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const multer = require('multer')
const path = require('path')


const securePassword = async(password)=>{
  try{
      const passwordHash = await bcrypt.hash(password, 10);
      return passwordHash;
  }catch(error){
      console.log(error.message)
  }
}



const sendVarifyMail = async (req,name, email, user_id) => {
  try {

    const otp = generateOTP(4); 
    req.session.otp = otp;
    req.session.otpGeneratedTime = Date.now();
    const transporter = nodemailer.createTransport({

      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: 'neganishere73@gmail.com',
        pass: 'rrhm xbbp yrnh cras',
      },
    });

    const mailOptions = {
      from: 'neganishere73@gmail.com',
      to: email,
      subject: 'For verification purpose',
      html: `<p>Hello ${name}, please enter this OTP: <strong>${otp}</strong> to verify your email.</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email has been sent:', info.response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};


function generateOTP(length) {
    const characters = '0123456789'; // The characters to use for the OTP
    let otp = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      otp += characters[randomIndex];
    }
  
    return otp;
  }
  

  const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,path.join(__dirname,'../public/userImages'));
    },
    filename:(req,file,cb)=>{
        const name = Date.now()+'-'+file.originalname;
        cb(null,name);
    } 
})

const upload = multer({storage:storage})

  
  module.exports= {
    generateOTP,
    sendVarifyMail,
    securePassword,
    upload
  }