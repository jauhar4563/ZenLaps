const User = require('../models/userModel.js')
const Category = require('../models/categoryModel.js')
const Product = require('../models/productModel')
const {} =require('../helpers/helper')





// products add, list,delete, edit, view

const LoadProductAdd = async(req,res)=>{
    try{
        const id = req.session.admin;
        const adminData = await User.findOne({_id:id});
        const categoryName = await Category.find({},{_id:1,name:1});

        res.render('productAdd',{category:categoryName,admin:adminData})
    }catch(error){
        console.log(error.message)
    }
}


const addProduct = async(req,res)=>{
    try{
        const id = req.session.admin;
        const adminData = await User.findOne({_id:id});


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
        const categoryName = await Category.find({},{_id:1,name:1});


        if (existingProduct) {
            const id = req.session.admin;
            const adminData = await User.findOne({_id:id});
            res.render('productAdd',{error:"Product already exist",category:categoryName,admin:adminData})
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


            if(productData){

                res.redirect('/admin/productList')
            }
            else{
                res.render('productAdd',{error:"Product cannot be added",category:categoryName,admin:adminData})

            }

        }



    }catch(error){
        console.log(error.message)
    }
}


const productList = async (req,res)=>{
    try{
        const id = req.session.admin;
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
        const id2 = req.session.admin;
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
            updateData.image= req.files.map((file) =>file.filename);
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



//------------------------------------------- User side------------------------------------------------------



const UserLoadProducts = async(req,res)=>{
    try{
      
      const userData = await User.findById({_id:req.session.user_id})

      const products = await Product.find({is_listed:1});
      const categoryList = await Category.find({is_listed:1});

      res.render('productShop',{category:categoryList,products:products,User:userData})
    }catch(error){

    }
  }

// view Product

  const UserViewProduct = async(req,res)=>{
    try{
      const id = req.query.id;
      const productData = await Product.findById(id);
      const userData = await User.find()
      res.render('productView',{product:productData,User:User,})

    }catch(error){
      console.log(error.message)
    }
  }

module.exports = {
    LoadProductAdd,
    addProduct,
    productList,
    unlistProduct,
    editProductLoad,
    updateProduct,
    productDelete,
    UserLoadProducts,
    UserViewProduct
}