const User = require('../models/userModel.js')
const Category = require('../models/categoryModel.js')
const Product = require('../models/productModel')
const bcrypt = require('bcrypt')
const {} =require('../helpers/helper')
require("dotenv").config();




const loadLogin = async(req,res)=>{
    try{

        res.render('login')
    }
    catch(error){
        console.log(error.message);
    }
}






const verifyLogin = async(req,res)=>{
    try{
        const email = req.body.email;
        const password = req.body.password;
        const adminData = await User.findOne({email:email});
        if(adminData){
                        const passwordMach = await bcrypt.compare(password,adminData.password);
                        if(passwordMach){
                            if(adminData.is_superAdmin == 1){
                                req.session.adminData = adminData;
                                req.session.admin = adminData.id;                                res.redirect('/admin/home')
                            }
                            else{
                              
                                res.render('login',{error:"You are not authorised to login"})
                            }
                        }else{
                            res.render('login',{error:"Email and password is incorrect"})
                        }
                    }else{
                        res.render('login',{error:"Email and password is incorrect"})
                    }
    }catch(error){
        console.log(error.message)
    }
}



const loadHome = async (req,res)=>{
    try{
        const adminData = req.session.adminData;
        res.render('home',{admin:adminData})
    }catch(error){
        console.log(error.message)
    }
}


// user list


const userList = async (req, res) => {
    try {
        const adminData = req.session.adminData;
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        let query = { is_superAdmin: false };

        if (req.query.status) {
            if (req.query.status === 'blocked') {
                query.is_blocked = true;
            } else if (req.query.status === 'unblocked') {
                query.is_blocked = false;
            }
        }

        const totalCount = await User.countDocuments(query);

        const totalPages = Math.ceil(totalCount / limit);

        const users = await User.find(query)
            .skip((page - 1) * limit)
            .limit(limit);

        res.render('userList', { users, admin: adminData, totalPages, currentPage: page });
    } catch (error) {
        console.log(error.message);
    }
};



const blockUser = async (req, res) => {
    try {
      const id = req.query.id;
      const userData = await User.findById({ _id: id });
  
      if (userData.is_blocked === 0) {
        // If user is not blocked, set is_blocked to 1
        userData.is_blocked = 1;
        delete req.session.user_id;
      } else {
        userData.is_blocked = 0;
      }
  
      await userData.save();
  res.redirect('/admin/userList')
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  };




const logout = async (req,res)=>{
    try{
         req.session.destroy();
        res.redirect('/admin')
    }catch(error){
        console.log(error.message)
    }
}

module.exports = {
    loadLogin,
    verifyLogin,
    loadHome,
    logout,
    userList,
    blockUser,
}