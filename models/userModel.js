const mongoose=require('mongoose')

const userSchema = new mongoose.Schema({

    name:{

        type:String,
        required:true,

    },
    email:{

        type:String,
        required:true

    },
    mobile:{
        type:String,
        required:true
    },
    image:{

        type:String,
        required:true

    },
    password:{
        
        type:String,
        required:true
    
    },
    status: {
        type: String,
        default: 'active',
    },
    createdDate: {
        type: Date,
        default: Date.now,
      },
      walletBalance: {
        type: Number,
        default: 0,
      },
      is_blocked:{
        type:Number,
        default: 0,
        
      },
      is_superAdmin:{
        type:Number,
        default: 0,
      },
    is_admin:{
        
        type:Number,
        default:0,
    
    },
    is_verified:{
    
        type:Boolean,
        default:false
    
    }
})
module.exports = mongoose.model('User',userSchema)