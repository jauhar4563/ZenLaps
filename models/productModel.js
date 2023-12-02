const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  price: {
    type: Number,
    required: true,
  },
  discountPrice: {
    type: Number,
    required: true,
  },
  image: [
    {
      type: String,
      required: true,
    },
  ],
  brand: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  modelName: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  processorBrand: {
    type: String,
    required: true,
  },
  processorName: {
    type: String,
    required: true,
  },
  processorGen: {
    type: String,
    required: true,
  },
  ssd: {
    type: String,
    required: true,
  },
  ram: {
    type: String,
    required: true,
  },
  ramType: {
    type: String,
    required: true,
  },
  clockSpeed: {
    type: String,
    required: true,
  },
  graphicsCard: {
    type: String,
    required: true,
  },
  numberOfCores: {
    type: Number,
    required: true,
  },
  osArchitecture: {
    type: String,
    defalut: 64,
  },
  os: {
    type: String,
    default: "Windows 11",
  },
  is_touchScreen: {
    type: Boolean,
    default: false,
  },
  screenSize: {
    type: String,
    required: true,
  },
  screenType: {
    type: String,
    required: true,
  },
  is_fingerPrint: {
    type: Boolean,
    default: false,
  },
  is_webCam: {
    type: Boolean,
    default: false,
  },
  is_backLit: {
    type: Boolean,
    default: false,
  },
  ratings: [Number],
  
  quantity: {
    type: Number,
    required: true,
  },
  is_listed: {
    type: Boolean,
    defalut: true,
  },
  discountStatus:{
    type:Boolean,
    default:false
  },
  discount:Number,
  discountStart:Date,
  discountEnd:Date,
});

module.exports = mongoose.model("Product", productSchema);
