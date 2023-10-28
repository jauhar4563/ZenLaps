const User = require('../models/userModel.js')
const Category = require('../models/categoryModel.js')
const {} =require('../helpers/helper')




const loadCategory = async(req,res)=>{
    try{
        const id = req.session.admin;
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
        const id = req.session.admin;
        const adminData = await User.findOne({_id:id});
        const title = req.body.name;
        const description = req.body.description;
        let image = ''; 
        if (req.file) {
            image = req.file.filename;
        }


        const existingCategory = await Category.findOne({ name: title });

        if (existingCategory) {
            res.render('categoryAdd', {
                error: "Category with the same name already exists",
                admin: adminData
            });
        } else {
            const category = new Category({
                name: title,
                image: image,
                description: description,
            });

            const userData = await category.save();

            if (userData) {
                return res.redirect('/admin/categoryList');
            } else {
                return res.render('categoryAdd', {
                    error: "Category cannot be added",
                    admin: adminData
                });
            }
        }
    } catch (error) {
        console.log(error.message);
           
    }
}



  const listCategory = async (req, res)=>{
    try{
        const id = req.session.admin;
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
        const id2 = req.session.admin;
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
module.exports= {
    loadCategory,
    insertCategory,
    listCategory,
    unlistCategory,
    loadCategoryEdit,
    editCategory,
}