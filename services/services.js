const nodemailer = require("nodemailer");
const { generateOTP } = require("../helpers/helper");

const sendVarifyMail = async (req, name, email) => {
  try {
    const otp = generateOTP(4);
    req.session.otp = otp;
    console.log(req.session.otp);
    req.session.otpGeneratedTime = Date.now();
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "neganishere73@gmail.com",
        pass: "jtgw kyzh czzo efeb",
      },
    });

    const mailOptions = {
      from: "neganishere73@gmail.com",
      to: email,
      subject: "For verification purpose",
      html: `<p>Hello ${name}, please enter this OTP: <strong>${otp}</strong> to verify your email.</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent:", info.response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};





module.exports = {
  sendVarifyMail,
};
