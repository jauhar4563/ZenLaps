const User = require('../models/userModel.js')
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
        if(req.body.email == process.env.EMAIL && req.body.password == process.env.PASSWORD){
            req.session.name = process.env.NAME;
            res.redirect('/admin/home')
        }
        else{
            res.render('login',{error:"Invalid email or passowrd"})
        }
    }catch(error){
        console.log(error.message)
    }
}

const loadHome = async (req,res)=>{
    try{
        res.render('home')
    }catch(error){
        console.log(error.message)
    }
}


// user list

const userList = async (req,res)=>{
    try{
        const userList = await User.find({is_admin:0,is_superAdmin:0});
        res.render('userList',{users:userList});
    }catch(error){
        console.log(error.message);
    }
}


const logout = async (req,res)=>{
    try{
        res.render('login',{message:"Logout Successfull"})
    }catch(error){
        console.log(error.message)
    }
}

module.exports = {
    loadLogin,
    verifyLogin,
    loadHome,
    logout,
    userList
}