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



// const verifyLogin = async(req,res)=>{
//     try{
//         const email = req.body.email;
//         const password = req.body.password;
//         const userData = await User.findOne({email:email});
//         if(userData){
//             const passwordMach = await bcrypt.compare(password,userData.password);
//             if(passwordMach){
//                 if(userData.is_verified === 0){
//                     res.render('login',{message:"please varify your mail."})
//                 }
//                 else{
//                     req.session.user_id = userData._id;
//                     req.session.user = email;
//                     res.redirect('/home')
//                   }
//             }else{
//                 res.render('login',{message:"Email and password is incorrect"})
//             }
//         }else{
//             res.render('login',{message:"Email and password is incorrect"})
//         }
//     }catch(error){
//         console.log(error.message)
//     }
//   }



const verifyLogin = async(req,res)=>{
    try{
        const email = req.body.email;
        const password = req.body.password;
        const adminData = await User.findOne({email:email});
        if(adminData){
                        const passwordMach = await bcrypt.compare(password,adminData.password);
                        if(passwordMach){
                            if(adminData.is_superAdmin == 1){
                                req.session.id3 = adminData.id;
                                res.redirect('/admin/home')
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
        const id = req.session.id3;
        const adminData = await User.findOne({_id:id});
        res.render('home',{admin:adminData})
    }catch(error){
        console.log(error.message)
    }
}


// user list

const userList = async (req,res)=>{
    try{
        const id = req.session.id3;
        const adminData = await User.findOne({_id:id});
        const userList = await User.find({is_admin:0,is_superAdmin:0});
        res.render('userList',{users:userList,admin:adminData});
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
        const id = req.session.id3;
        const adminData = await User.findOne({_id:id});
        res.render('categoryAdd',{admin:adminData})
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
        const id = req.session.id3;
        const adminData = await User.findOne({_id:id});
        const categoryList = await Category.find();
        res.render('categoryList',{categories:categoryList,admin:adminData})
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

  const  loadCategoryEdit = async(req,res)=>{
    try{
        const id2 = req.session.id3;
        const adminData = await User.findOne({_id:id2});
        const id = req.query.id;
        const categoryData = await Category.findById(id);
                res.render('categoryEdit',{category:categoryData,admin:adminData});
    }catch(error){
        console.log(error.message)
    }
  }


  const editCategory = async(req,res) =>{
    try{
        const id = req.body.category_id;
        const updateData = await Category.findById(id);

        if (req.body.name) {
            updateData.name = req.body.name;
        }
        if (req.body.description) {
            updateData.description = req.body.name;
        }
        if (req.file) {
            updateData.image = req.file.filename;
        }

           

            // Save the category to the database
            await updateData.save();

           
    res.redirect('/admin/categoryList') 
        
    }catch(error){
        console.log(error.message)
    }

  }




// products add, list,delete, edit, view

const LoadProductAdd = async(req,res)=>{
    try{
        const id = req.session.id3;
        const adminData = await User.findOne({_id:id});
        const categoryName = await Category.find({},{_id:1,name:1});

        res.render('productAdd',{category:categoryName,admin:adminData})
    }catch(error){
        console.log(error.message)
    }
}


const addProduct = async(req,res)=>{
    try{
        const name = req.body.name;
        const description = req.body.description;
        const image = req.files.map((file) =>file.filename);
        const price = req.body.price;
        const quantity = req.body.quantity
        const discountPrice = req.body.discountPrice;
        const color = req.body.color;
        const category = req.body.category
        const brand = req.body.brand;
        const seriesName = req.body.sname;
        const processorBrand = req.body.processorBrand;
        const processorGen = req.body.processorGen;
        const ProcessorName = req.body.ProcessorName;
        const graphics = req.body.graphicsCard;
        const ssd = req.body.ssd;
        const ram = req.body.ram;
        const ramType = req.body.ramType;
        const clockSpeed = req.body.clockSpeed;
        const noOfCores = req.body.noOfCores;
        const os = req.body.os;
        const osArch = req.body.osArch;
        const screenSize = req.body.screenSize;
        const screenType = req.body.screenType;
        const touchScreen = req.body.touchScreen;
        const is_backLit = req.body.backlit;
        const is_fingerPrint = req.body.fingerPrint;
        const is_webcam = req.body.webcam;
        const existingProduct = await Product.findOne({ name: name, modelName: seriesName });
        

        if (existingProduct) {
            res.status(400).render('productAdd', { error: "Product already exists" });
        } 
        else{
            const product = new Product({
                name:name,
                price:price,
                discountPrice:discountPrice,
                image:image,
                brand:brand,
                description:description,
                modelName:seriesName,
                color:color,
                category:category,
                processorBrand:processorBrand,
                processorName: ProcessorName,
                processorGen:processorGen,
                ssd:ssd,
                ram:ram,
                ramType:ramType,
                clockSpeed:clockSpeed,
                graphicsCard:graphics,
                numberOfCores:noOfCores,
                osArchitecture:osArch,
                os:os,
                quantity:quantity,
                is_touchScreen:touchScreen,
                screenSize:screenSize,
                screenType:screenType,
                is_fingerPrint:is_fingerPrint,
                is_webCam:is_webcam,
                is_backLit:is_backLit
            });

            const productData = await product.save();
            const categoryName = await Category.find({},{_id:1,name:1});

            if(productData){

                res.render('productAdd',{message:"Product added succesfully",category:categoryName})
            }
            else{
                res.render('productAdd',{error:"Product cannot be added",category:categoryName})

            }

        }



    }catch(error){
        console.log(error.message)
    }
}


const productList = async (req,res)=>{
    try{
        const id = req.session.id3;
        const adminData = await User.findOne({_id:id});
        const products = await Product.find({});
        res.render('productList',{products:products,admin:adminData})

    }catch(error){
        console.log(error.message)
    }
}

const unlistProduct = async (req, res) => {
    try {
        const id = req.query.id;
        const productData = await Product.findById({ _id: id });

        if (!productData) {
            // Handle the case where no product with the given _id was found
            console.log('Product not found');
            res.redirect('/admin/productList'); // Redirect to the product list page or display an error message
            return;
        }

        if (productData.is_listed == false) {
            // If the product is not listed, set is_listed to true (list it)
            productData.is_listed = true;
        } else {
            // If the product is listed, set is_listed to false (unlist it)
            productData.is_listed = false;
        }

        await productData.save(); // Save the updated product data
        res.redirect('/admin/productList'); // Redirect to the product list page
    } catch (error) {
        console.log(error.message);
        // Handle other errors here
    }
}

const editProductLoad = async(req,res)=>{
    try{
        const id2 = req.session.id3;
        const adminData = await User.findOne({_id:id2});
        const id = req.query.id;
        const categoryName = await Category.find({},{_id:1,name:1});

        const productData = await Product.findById({_id:id})
        res.render('productEdit',{products:productData,category:categoryName,admin:adminData})
    }catch(error){
        console.log(error.message)
    }
}


const updateProduct = async (req, res) => {
    try {
        const id = req.body.product_id;
        console.log(id);
        const updateData = await Product.findById(id);
        if (!updateData) {
            res.render('productEdit',{error:"User not found"})        }
  
        if (req.body.name) {
            updateData.name = req.body.name;
        }
        if (req.body.description) {
            updateData.description = req.body.description;
        }
        if (req.body.price) {
            updateData.price = req.body.price;
        }
        if (req.body.quantity) {
            updateData.quantity = req.body.quantity;
        }
        if (req.body.discountPrice) {
            updateData.discountPrice = req.body.discountPrice;
        }
        if (req.body.color) {
            updateData.color = req.body.color;
        }
        if (req.body.category) {
            updateData.category = req.body.category;
        }
        if (req.body.brand) {
            updateData.brand = req.body.brand;
        }
        if (req.body.sname) {
            updateData.modelName = req.body.sname;
        }
        if (req.body.processorBrand) {
            updateData.processorBrand = req.body.processorBrand;
        }
        if (req.body.processorGen) {
            updateData.processorGen = req.body.processorGen;
        }
        if (req.body.ProcessorName) {
            updateData.processorName = req.body.ProcessorName;
        }
        if (req.body.graphicsCard) {
            updateData.graphicsCard = req.body.graphicsCard;
        }
        if (req.body.ssd) {
            updateData.ssd = req.body.ssd;
        }
        if (req.body.ram) {
            updateData.ram = req.body.ram;
        }
        if (req.body.ramType) {
            updateData.ramType = req.body.ramType;
        }
        if (req.body.clockSpeed) {
            updateData.clockSpeed = req.body.clockSpeed;
        }
        if (req.body.noOfCores) {
            updateData.numberOfCores = req.body.noOfCores;
        }
        if (req.body.os) {
            updateData.os = req.body.os;
        }
        if (req.body.osArch) {
            updateData.osArchitecture = req.body.osArch;
        }
        if (req.body.screenSize) {
            updateData.screenSize = req.body.screenSize;
        }
        if (req.body.screenType) {
            updateData.screenType = req.body.screenType;
        }
        if (req.body.touchScreen) {
            updateData.is_touchScreen = req.body.touchScreen;
        }
        if (req.body.backlit) {
            updateData.is_backLit = req.body.backlit;
        }
        if (req.body.fingerPrint) {
            updateData.is_fingerPrint = req.body.fingerPrint;
        }
        if (req.body.webcam) {
            updateData.is_webCam = req.body.webcam;
        }

        if (req.files) {
            for (let i = 0; i < updateData.image.length; i++) {
                if (req.files[i] && req.files[i].fieldname === `image[${i}]`) {
                  updateData.image[i] = req.files[i].filename;
                }
              }

        }
        await updateData.save();
        res.redirect('/admin/productList')
        
    } catch (error) {
        console.log(error.message);
    }
};
  


const productDelete = async(req,res)=>{
    try{
        const id = req.query.id;
        await Product.deleteOne({_id:id})
        res.redirect('/admin/productList');
    }catch(error){
        console.log(error.message)
    }
}



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
    loadCategory,
    insertCategory,
    listCategory,
    unlistCategory,
    LoadProductAdd,
    addProduct,
    productList,
    unlistProduct,
    editProductLoad,
    updateProduct,
    loadCategoryEdit,
    editCategory,
    productDelete
}