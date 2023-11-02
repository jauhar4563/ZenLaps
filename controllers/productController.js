const User = require('../models/userModel.js')
const Category = require('../models/categoryModel.js')
const Product = require('../models/productModel')
const {} =require('../helpers/helper')





// products add, list,delete, edit, view

const LoadProductAdd = async(req,res)=>{
    try{
        const adminData = req.session.adminData;
        const categoryName = await Category.find({},{_id:1,name:1});

        res.render('productAdd',{category:categoryName,admin:adminData})
    }catch(error){
        console.log(error.message)
    }
}


const addProduct = async(req,res)=>{
    try{
        const adminData = req.session.adminData;


        const name = req.body.name;
        const image =[];
        const description = req.body.description;
        if(req.files){
            console.log(req.files);
            for (const file of req.files) {

                image.push(file.filename);
            }

        }
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



// const productList = async (req, res) => {
//     try {
//       const adminData = req.session.adminData;
//       const page = parseInt(req.query.page) || 1;
//       const productsPerPage = 2; 
  
//       const totalCount = await Product.countDocuments({});
  
//       const totalPages = Math.ceil(totalCount / productsPerPage);

      
//       const products = await Product.find({query})
//         .skip((page - 1) * productsPerPage)
//         .limit(productsPerPage);
    
//       res.render('productList', { products, admin: adminData, totalPages, currentPage: page });
//     } catch (error) {
//       console.log(error.message);
//     }
//   };


const productList = async (req, res) => {
    try {
        const adminData = req.session.adminData;
        const page = parseInt(req.query.page) || 1;
        const productsPerPage = 10;
        let query = {};

        if (req.query.category) {
            query.category = req.query.category;
        }

        if (req.query.status) {
            if (req.query.status === 'listed') {
                query.is_listed = true;
            } else if (req.query.status === 'unlisted') {
                query.is_listed = false;
            }
        }

        const totalCount = await Product.countDocuments(query);

        const totalPages = Math.ceil(totalCount / productsPerPage);

        const products = await Product.find(query)
            .skip((page - 1) * productsPerPage)
            .limit(productsPerPage);

        const distinctCategories = await Product.distinct('category');

        res.render('productList', {
            products,
            admin: adminData,
            totalPages,
            currentPage: page,
            categories: distinctCategories,
        });
    } catch (error) {
        console.log(error.message);
    }
};

  

const unlistProduct = async (req, res) => {
    try {
        const id = req.query.id;
        const productData = await Product.findById({ _id: id });

        if (!productData) {
            console.log('Product not found');
            res.redirect('/admin/productList'); 
            return;
        }

        if (productData.is_listed == false) {
            productData.is_listed = true;
        } else {
           
            productData.is_listed = false;
        }

        await productData.save();
        res.redirect('/admin/productList'); 
    } catch (error) {
        console.log(error.message);
    }
}

const editProductLoad = async(req,res)=>{
    try{
        const adminData = req.session.adminData;
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

        const existingImages = updateData.image;

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
            req.files.forEach((file, index) => {
                if (existingImages[index]) {
                    existingImages[index] = file.filename;
                }
            });

            updateData.image = existingImages;
        }
        
        await updateData.save();
        res.redirect('/admin/productList')
        
    } catch (error) {
        console.log(error.message);
    }
};



//------------------------------------------- User side------------------------------------------------------




// const UserLoadProducts = async (req, res) => {
//     try {
//         const userData = req.session.userData;
//         const categoryList = await Category.find({ is_listed: true }, { image: 1, name: 1 });
//         const page = parseInt(req.query.page) || 1;
//         const productsPerPage = 10;
//         let query = { is_listed: true };

//         if (req.query.category) {
//             query.category = req.query.category;
//         }
        

//         const totalCount = await Product.countDocuments(query);
//         const totalPages = Math.ceil(totalCount / productsPerPage);
//         const distinctCategories = await Category.find({ is_listed: true }, { name: 1, _id: 0 });

//         const products = await Product.find(query)
//             .sort({ date: -1 })
//             .skip((page - 1) * productsPerPage)
//             .limit(productsPerPage);

//         res.render('productShop', {  products, User: userData, totalPages, currentPage: page,categories: categoryList});
//     } catch (error) {
//         console.log(error.message);
//     }
// };
const UserLoadProducts = async (req, res) => {
    try {
        const userData = req.session.userData;
        const page = parseInt(req.query.page) || 1;
        const productsPerPage = 10;
        let query = { is_listed: true };
        if (req.query.category) {
            query.category = { $in: Array.isArray(req.query.category) ? req.query.category : [req.query.category] };
        }

        if (req.query.brands) {
            query.brand = { $in: Array.isArray(req.query.brands) ? req.query.brands : [req.query.brands] };
        }

        if (req.query.ram) {
            query.ram = { $in: Array.isArray(req.query.ram) ? req.query.ram : [req.query.ram] };
        }

        if (req.query.ssd) {
            query.ssd = { $in: Array.isArray(req.query.ssd) ? req.query.ssd : [req.query.ssd] };
        }

        if (req.query.processor) {
            query.processor = { $in: Array.isArray(req.query.processor) ? req.query.processor : [req.query.processor] };
        }

        if (req.query.graphicsCard) {
            query.graphicsCard = { $in: Array.isArray(req.query.graphicsCard) ? req.query.graphicsCard : [req.query.graphicsCard] };
        }

        if (req.query.screenSize) {
            query.screenSize = { $in: Array.isArray(req.query.screenSize) ? req.query.screenSize : [req.query.screenSize] };
        }

        const totalCount = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalCount / productsPerPage);

        const distinctValues = (await Product.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    categories:{ $addToSet: "$category"},
                    brands: { $addToSet: "$brand" },
                    ram: { $addToSet: "$ram" },
                    ssd: { $addToSet: "$ssd" },
                    processor: { $addToSet: "$processorBrand" },
                    graphicsCard: { $addToSet: "$graphicsCard" },
                    screenSize: { $addToSet: "$screenSize" },
                },
            },
        ])).shift();
        const distinctCategories = {
            categories: distinctValues.categories || [],
            brands: distinctValues.brands || [],
            ram: distinctValues.ram || [],
            ssd: distinctValues.ssd || [],
            processor: distinctValues.processor || [],
            graphicsCard: distinctValues.graphicsCard || [],
            screenSize: distinctValues.screenSize || [],
        };
        const products = await Product.find(query)
            .sort({ date: -1 })
            .skip((page - 1) * productsPerPage)
            .limit(productsPerPage);

        res.render('productShop', {
            products,
            User: userData,
            totalPages,
            currentPage: page,
            distinctValues: distinctCategories,
        });
    } catch (error) {
        console.log(error.message);
    }
};


  



  const UserViewProduct = async(req,res)=>{
    try{
      const id = req.query.id;
      const productData = await Product.findById(id);
        const sameProducts = await Product.find({category:productData.category}).limit(7);
        const userData = req.session.userData;
        res.render('productView',{product:productData,User:userData,sameProducts:sameProducts})

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
    UserLoadProducts,
    UserViewProduct
}