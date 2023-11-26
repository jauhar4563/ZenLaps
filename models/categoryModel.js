const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
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
  discount:String,
  discountStart:Date,
  discountEnd:Date,
});

module.exports = mongoose.model("Category", categorySchema);
