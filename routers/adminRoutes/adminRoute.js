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


route.set('views', './views/admin')


route.get('/',adminController.loadLogin);
route.post('/',adminController.verifyLogin)
route.get('/home',adminController.loadHome)
route.get('/logout',adminController.logout)

route.get('/userList',adminController.userList)

module.exports = route

