const express = require('express')
const multer = require('multer')
const path = require('path')
const adminController = require('../../controllers/adminController')
const route = express()
const {isLogin,isLogout} = require('../../middlewares/adminAuth')

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,path.join(__dirname,'../../Public/userImages'));
    },
    filename:(req,file,cb)=>{
        const name = Date.now()+'-'+file.originalname;
        cb(null,name);
    } 
})
const upload = multer({storage:storage})


//multer for category uploads

// Define storage for category images
const categoryStorage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,path.join(__dirname,'../../Public/categoryImages'));
    },
    filename: function (req, file, cb) {
        // Set the filename for category images
        const name = Date.now()+'-'+file.originalname;
        cb(null,name);
    },
});

// Create a multer instance for category images
const uploadCategoryImage = multer({ storage: categoryStorage });


//  storage for product images

const ProductStorage = multer.diskStorage({
    destination: function (req, file, cb) {
   
      
      cb(null, path.join(__dirname, '../../public/productImages'));
    },
    filename: function (req, file, cb) {
      const name = Date.now() + '_' + file.originalname;
      cb(null, name);
    },
  });
  
  // Create the Multer instance
  const ProductUpload = multer({
    storage: ProductStorage,
    limits: { fileSize: 10 * 1024 * 1024 },

  });



route.set('views', './views/admin')


route.get('/',isLogout,adminController.loadLogin);
route.post('/',adminController.verifyLogin)
route.get('/home',isLogin,adminController.loadHome)
route.get('/logout',isLogin,adminController.logout)

route.get('/userList',isLogin,adminController.userList)
route.get('/blockUser',isLogin,adminController.blockUser)

route.get('/categoryAdd',isLogin,adminController.loadCategory);
route.post('/categoryAdd',uploadCategoryImage.single('image'),adminController.insertCategory);

route.get('/categoryList',isLogin,adminController.listCategory)
route.get('/unlistCategory',adminController.unlistCategory)

route.get('/categoryEdit',isLogin,adminController.loadCategoryEdit)
route.post('/categoryEdit',uploadCategoryImage.single('image'),adminController.editCategory)

route.get('/productAdd',isLogin,adminController.LoadProductAdd)
route.post('/productAdd',ProductUpload.array('image',4),adminController.addProduct)

route.get('/productList',isLogin,adminController.productList)
route.get('/unlistProduct',adminController.unlistProduct)

route.get('/editProduct',isLogin,adminController.editProductLoad)
route.post('/editProduct',ProductUpload.array('image', 4),adminController.updateProduct)

route.get('/deleteProduct',adminController.productDelete)

module.exports = route

