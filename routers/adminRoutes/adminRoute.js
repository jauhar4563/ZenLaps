const express = require('express')
const multer = require('multer')
const path = require('path')
const adminController = require('../../controllers/adminController')
const route = express()
const auth = require('../../middlewares/adminAuth')

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



route.set('views', './views/admin')


route.get('/',adminController.loadLogin);
route.post('/',adminController.verifyLogin)
route.get('/home',adminController.loadHome)
route.get('/logout',adminController.logout)

route.get('/userList',adminController.userList)
route.get('/blockUser',adminController.blockUser)

route.get('/categoryAdd',adminController.loadCategory);
route.post('/categoryAdd',uploadCategoryImage.single('image'),adminController.insertCategory);

route.get('/categoryList',adminController.listCategory)
route.get('/unlistCategory',adminController.unlistCategory)



module.exports = route

