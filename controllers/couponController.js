const User = require('../models/userModel');
const Coupon =require('../models/couponModel');


const loadCouponAdd = async(req,res)=>{
    try{
        const admin = req.session.adminData;
        res.render('couponAdd',{admin})
    }catch(error){
        console.log(error.message);
    }
}

const addCoupon = async(req,res)=>{
    try{
        const admin = req.session.adminData;
        let { couponCode, discount, expiryDate, limit, DiscountType,maxRedeemableAmt,minCartAmt} = req.body;
        
    
        couponCode = couponCode.replace(/\s/g, '');
      
        console.log(req.body);
        console.log(couponCode);
      
    
          if (!couponCode) {
            return res.render('coupon-add', { message: "Coupon code cannot be empty", admin: admin });
          }
      
    
          const existingCoupon = await Coupon.findOne({ code: { $regex: new RegExp('^' + couponCode, 'i') } });
      
          if (existingCoupon) {
            return res.render('coupon-add', { message: "Coupon code already exists", admin: admin });
          }
      
          const newCoupon = new Coupon({
            code: couponCode,
            discount: discount,
            limit: limit,
            type: DiscountType,
            expiry: expiryDate,
            maxRedeemableAmt:maxRedeemableAmt,
            minCartAmt:minCartAmt
    
          });
      
          await newCoupon.save();
          res.redirect('/admin/couponList');
    }catch(error){
        console.log(error.message);
    }
}

const couponList = async(req,res)=>{
    try{

        const admin = req.session.adminData;
        const page = parseInt(req.query.page) || 1;
        let query = {};
        const limit = 7;
        const totalCount = await Coupon.countDocuments(query);
    
        const totalPages = Math.ceil(totalCount / limit);
        const coupon = await Coupon.find().skip((page - 1) * limit)
        .limit(limit).sort({createdDate:-1});
        res.render('couponList',{coupon,admin, totalPages, currentPage: page })
        }catch(error){
        console.log(error.message)
        }
}

const loadEditCoupon = async(req,res)=>{
    try{
        const admin = req.session.adminData;
        const couponId =req.query.couponId;
        const coupon = await Coupon.findById(couponId)
        res.render('couponEdit',{admin,coupon})

    }catch(error){
        console.log(error.message)
    }
}


const editCoupon = async(req,res)=>{
    try{

        const couponId = req.body.couponId;
        const editCoupon = await Coupon.findById(couponId)
        if(req.body.couponCode)
        {
            editCoupon.code = req.body.couponCode;
        }
        if(req.body.discount){
            editCoupon.discount = req.body.discount;
        }
        if(req.body.expiryDate){
            editCoupon.expiry = req.body.expiry;
        }
        if(req.body.DiscountType){
            editCoupon.type = req.body.DiscountType;
        }
        if(req.body.maxRedeemableAmt){
            editCoupon.maxRedeemableAmt = req.body.maxRedeemableAmt;
        }
        if(req.body.minCartAmt){
            editCoupon.minCartAmt= req.body.minCartAmt;
        }
        if(req.body.limit){
            editCoupon.limit = req.body.limit;
        }
        await editCoupon.save()
        res.redirect('/admin/couponList')
    }catch(error){
        console.log(error.message)
    }
}

const unlistCoupon = async(req,res)=>{
    try{
        const id = req.query.couponId;
    const couponData = await Coupon.findById({ _id: id });

    if (couponData.is_listed == false) {
      couponData.is_listed = true;   
    } else {
      couponData.is_listed = false;
    }

    await couponData.save();
    res.redirect("/admin/couponList");
    }catch(error){
        console.log(error.message)
    }
}

const couponDetails = async(req,res)=>{
    try{
        const admin=  req.session.adminData
        const couponId = req.query.couponId;
        const coupon = await Coupon.findById(couponId)
        .populate('usersUsed') 
        .sort({ _id: -1 })
        .exec();    
        const users = coupon.usersUsed;
        res.render('couponDetails', {users, coupon,admin:admin});
    }catch(error){
        console.log(error.message)
    }
}



// User Coupons list functions

const userCouponList = async(req,res)=>{
    try{
        const User = req.session.userData;
        const coupon = await Coupon.find({is_listed:true}).sort({createdDate:-1});
        res.render('coupons',{coupon,User})
    }catch(error){
        console.log(error.message);
    }
}

module.exports={
    loadCouponAdd,
    addCoupon,
    couponList,
    loadEditCoupon,
    editCoupon,
    unlistCoupon,
    couponDetails,
    userCouponList
}