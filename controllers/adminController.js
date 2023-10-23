const User = require('../models/userModel.js')
const Category = require('../models/categoryModel.js')

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

const blockUser = async (req, res) => {
    try {
      const id = req.query.id;
      const userData = await User.findById({ _id: id });
  
      if (userData.is_blocked === 0) {
        // If user is not blocked, set is_blocked to 1
        userData.is_blocked = 1;
      } else {
        // If user is blocked, set is_blocked to 0
        userData.is_blocked = 0;
      }
  
      await userData.save(); // Save the updated user data
  res.redirect('/admin/userList')
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  

  const loadCategory = async(req,res)=>{
    try{

        res.render('categoryAdd')
    }
    catch(error){
        console.log(error.message)
    }
  }


  //for category insert

  const insertCategory = async (req, res) => {
    try {
        const title = req.body.name;
        const description = req.body.description;
        const image = req.file.filename;

        // Check if a category with the same name already exists
        const existingCategory = await Category.findOne({ name: title });

        if (existingCategory) {
            res.status(400).render('categoryAdd', { error: "Category with the same name already exists" });
        } else {
            // Create a new Category instance
            const category = new Category({
                name: title,
                image: image,
                description: description,
            });

            // Save the category to the database
            const userData = await category.save();

            if (userData) {
                res.status(200).render('categoryAdd', { message: "Category Added successfully" });
            } else {
                res.status(500).render('categoryAdd', { error: "Category cannot be added" });
            }
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).render('categoryAdd', { error: "An error occurred" });
    }
}


  const listCategory = async (req, res)=>{
    try{
        const categoryList = await Category.find();
        res.render('categoryList',{categories:categoryList})
    }catch(error){
        console.log(error.message)
    }
  }


  const unlistCategory = async (req,res)=>{
    try{
        const id = req.query.id;
        const categoryData = await Category.findById({ _id: id });
    
        if (categoryData.is_listed == false) {
          // If user is not blocked, set is_blocked to 1
            categoryData.is_listed = true;
        } else {
          categoryData.is_listed = false;
        }
    
        await categoryData.save(); // Save the updated user data
    res.redirect('/admin/categoryList');
    }catch(error){
        console.log(error.message)
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
    userList,
    blockUser,
    loadCategory,
    insertCategory,
    listCategory,
    unlistCategory
}