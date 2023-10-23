const mongoose=require('mongoose')

const categorySchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    is_listed:{
        type:Boolean,
        defalut:true
    }

})

module.exports = mongoose.model('Category',categorySchema)