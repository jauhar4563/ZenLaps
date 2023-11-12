const express = require('express')
const multer = require('multer')
const path = require('path')
const adminController = require('../../controllers/adminController')
const productController = require('../../controllers/productController')
const categoryController = require('../../controllers/categoryController')
const orderController = require('../../controllers/orderController')
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
        const name = Date.now()+'-'+file.originalname;
        cb(null,name);
    },
});

const uploadCategoryImage = multer({ storage: categoryStorage });



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

route.get('/categoryAdd',isLogin,categoryController.loadCategory);
route.post('/categoryAdd',uploadCategoryImage.single('image'),categoryController.insertCategory);

route.get('/categoryList',isLogin,categoryController.listCategory)
route.get('/unlistCategory',categoryController.unlistCategory)

route.get('/categoryEdit',isLogin,categoryController.loadCategoryEdit)
route.post('/categoryEdit',uploadCategoryImage.single('image'),categoryController.editCategory)

route.get('/productAdd',isLogin,productController.LoadProductAdd)
route.post('/productAdd',ProductUpload.array('image',4),productController.addProduct)
route.get('/productDetails',isLogin,productController.AdminViewProduct);
route.get('/productList',isLogin,productController.productList)
route.get('/unlistProduct',productController.unlistProduct)

route.get('/editProduct',isLogin,productController.editProductLoad)
route.post('/editProduct',ProductUpload.array('image', 4),productController.updateProduct)

route.get('/orderList',isLogin,orderController.listUserOrders);
route.get('/orderDetails',isLogin,orderController.adminOrderDetails)
route.get('/refundOrder',isLogin,orderController.returnOrder);

route.get('/orderstatus',isLogin,orderController.changeOrderStatus)
module.exports = route

