const Banner = require('../models/bannerModel')


const loadBannerAdd = async(req,res)=>{
    try{

        const admin =req.session.adminData;
        res.render('bannerAdd',{admin})

    }catch(error){
        console.log(error.message);
    }
}


module.exports  = {
    loadBannerAdd
}