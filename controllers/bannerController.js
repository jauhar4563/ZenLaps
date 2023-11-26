const Banner = require('../models/bannerModel')
const Category = require('../models/categoryModel')
const Product = require('../models/productModel')



const loadBannerAdd = async(req,res)=>{
    try{
        const category  = await Category.find();
        const product = await Product.find();
        const admin =req.session.adminData;
        res.render('bannerAdd',{admin,category,product})

    }catch(error){
        console.log(error.message);
    }
}

const addBanner = async(req,res)=>{
    try{


        if(!req.body){
            res.redirect('/admin/bannerAdd')
        }
            
            const image=req.file.filename;
            const {title,link,subtitle,offer,bannerType,product,bannerCategory,fromDate,expiryDate} =req.body;
            const newBanner = new Banner({
                bannerType:bannerType,
                title,
                image,
                link,
                subtitle,
                offer,
                product,
                category:bannerCategory,
                startDate:fromDate,
                endDate:expiryDate,
                
            })
            await newBanner.save();
        
      res.redirect('/admin/bannerList')


    }catch(error){
        console.log(error.message)
    }
}


const bannerList = async(req,res)=>{
    try{
        const admin = req.session.adminData
        const page = parseInt(req.query.page) || 1;
        let query = {};
        const limit = 7;
        const totalCount = await Banner.countDocuments(query);
    
        const totalPages = Math.ceil(totalCount / limit);
        const banner = await Banner.find(query).skip((page - 1) * limit)
        .limit(limit).sort({startDate:-1})
        res.render('bannerList',{banner,admin, totalPages, currentPage: page })
    }catch(error){
        console.log(error.message)
    }
}


const loadBannerEdit = async(req,res)=>{
    try{
        const BannerId = req.query.bannerId;
        const banner = await Banner.findById(BannerId).populate('product');
        const category = await Category.find({})
        const admin = req.session.adminData;
        const product = await Product.find({});
        const startDate = new Date(banner.startDate).toISOString().split('T')[0];
        const endDate = new Date(banner.endDate).toISOString().split('T')[0];
        res.render('bannerEdit',{banner,product,category,admin,startDate,endDate})
    }catch(error){
        console.log(error.message)
    }
}

const bannerEdit = async(req,res)=>{
    try{
        const bannerId = req.body.bannerId;
        const bannerData = await Banner.findById(bannerId);
        if(req.body.title){
            bannerData.title = req.body.title;
        }
        if(req.body.bannerType){
            bannerData.bannerType = req.body.bannerType;
        }
        if(req.body.link){
            bannerData.link = req.body.link;
        }
        if(req.body.subtitle){
            bannerData.subtitle = req.body.subtitle;
        }
        if(req.body.offer){
            bannerData.offer = req.body.offer;
        }
        if(req.body.category){
            bannerData.category = req.body.category;
        }
        if(req.body.product){
            bannerData.product = req.body.product;
        }
        if(req.body.startDate){
            bannerData.startDate = req.body.startDate;
        }
        if(req.body.endDate){
            bannerData.endDate = req.body.endDate;
        }
        if(req.file){
            bannerData.image = req.file.filename;
        }
      await bannerData.save();
      res.redirect('/admin/bannerList');
    }catch(error){
        console.log(error.message)
    }
}

module.exports  = {
    loadBannerAdd,
    addBanner,
    bannerList,
    loadBannerEdit,
    bannerEdit
}