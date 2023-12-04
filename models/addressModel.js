const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type:String,
    required:true
  },
  phone: {
    type:String
  },
  houseName: {
    type:String,
  },
  name: {
    type:String,
  },
  street: {
    type:String,
  },
  city: {
    type:String,
  },
  state: {
    type:String,
  },
  pincode: {
    type:String,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  is_default:{
    type:Boolean,
    default:false
  }
});

module.exports = mongoose.model('Address', addressSchema);