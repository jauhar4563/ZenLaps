const Category = require("../models/categoryModel.js");
const {} = require("../helpers/helper");
const Product = require("../models/productModel");

// load category Page

const loadCategory = async (req, res) => {
  try {
    const adminData = req.session.adminData;

    res.render("categoryAdd", { admin: adminData });
  } catch (error) {
    console.log(error.message);
  }
};

//for category insert

const insertCategory = async (req, res) => {
  try {
    const adminData = req.session.adminData;
    const title = req.body.name;
    const description = req.body.description;
    let image = "";
    if (req.file) {
      image = req.file.filename;
    }

    const existingCategory = await Category.findOne({ name: title });

    if (existingCategory) {
      res.render("categoryAdd", {
        error: "Category with the same name already exists",
        admin: adminData,
      });
    } else {
      const category = new Category({
        name: title,
        image: image,
        description: description,
        is_listed:true
      });

      const userData = await category.save();

      if (userData) {
        return res.redirect("/admin/categoryList");
      } else {
        return res.render("categoryAdd", {
          error: "Category cannot be added",
          admin: adminData,
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

// Categories listing

const listCategory = async (req, res) => {
  try {
    const adminData = req.session.adminData;

    const page = parseInt(req.query.page) || 1;
    const categoriesPerPage = 10;
    let query = {};

    if (req.query.status) {
      if (req.query.status === "listed") {
        query.is_listed = true;
      } else if (req.query.status === "unlisted") {
        query.is_listed = false;
      }
    }

    const totalCount = await Product.countDocuments(query);

    //   const totalCount = await Category.countDocuments({});

    const totalPages = Math.ceil(totalCount / categoriesPerPage);

    const categories = await Category.find(query)
      .skip((page - 1) * categoriesPerPage)
      .limit(categoriesPerPage);

    res.render("categoryList", {
      categories,
      admin: adminData,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// Unlist Categories

const unlistCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const categoryData = await Category.findById({ _id: id });
    const productData = await Product.find({ category: categoryData.name });

    if (categoryData.is_listed == false) {
      categoryData.is_listed = true;
      for (const product of productData) {
        product.is_listed = true;
        await product.save();
      }
    } else {
      categoryData.is_listed = false;
      for (const product of productData) {
        product.is_listed = false;
        await product.save();
      }
    }

    await categoryData.save();
    res.redirect("/admin/categoryList");
  } catch (error) {
    console.log(error.message);
  }
};

// Category Edit page load

const loadCategoryEdit = async (req, res) => {
  try {
    const adminData = req.session.adminData;
    const id = req.query.id;
    const categoryData = await Category.findById(id);
    res.render("categoryEdit", { category: categoryData, admin: adminData });
  } catch (error) {
    console.log(error.message);
  }
};

//   Update category

const editCategory = async (req, res) => {
  try {
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

    res.redirect("/admin/categoryList");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadCategory,
  insertCategory,
  listCategory,
  unlistCategory,
  loadCategoryEdit,
  editCategory,
};
