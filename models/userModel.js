const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: "user.png",
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "active",
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  walletBalance: {
    type: Number,
    default: 0,
  },
  is_blocked: {
    type: Number,
    default: 0,
  },
  is_superAdmin: {
    type: Boolean,
    default: false,
  },
  is_admin: {
    type: Boolean,
    default: false,
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  referralCode: {
    type: String,
    default: generateRandomReferralCode,
},
referredUsers: [{
    type: String,
}],
});

function generateRandomReferralCode() {

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const codeLength = 6;
let referralCode = '';
for (let i = 0; i < codeLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    referralCode += characters.charAt(randomIndex);
}
return referralCode;
}

module.exports = mongoose.model("User", userSchema);
