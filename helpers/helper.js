const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
require("dotenv").config();


const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};



function generateOTP(length) {
  const characters = "0123456789";
  let otp = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    otp += characters[randomIndex];
  }

  return otp;
}

const calculateSubtotal = (cart) => {
  let subtotal = 0;
  for (const cartItem of cart) {
    subtotal += cartItem.product.discountPrice * cartItem.quantity;
  }
  return subtotal;
};

const calculateProductTotal = (cart) => {
  const productTotals = [];
  for (const cartItem of cart) {
      const total = cartItem.product.discountPrice * cartItem.quantity;
      productTotals.push(total);
  }
  return productTotals;
};

module.exports = {
  generateOTP,
  securePassword,
  calculateSubtotal,
  calculateProductTotal
};
