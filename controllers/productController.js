const User = require("../models/userModel.js");
const Category = require("../models/categoryModel.js");
const Product = require("../models/productModel");
const {} = require("../helpers/helper");
const sharp = require("sharp");
const path = require("path");
// products add, list,delete, edi

// Render Products add page

const LoadProductAdd = async (req, res) => {
  try {
    const adminData = req.session.adminData;
    const categoryName = await Category.find({}, { _id: 1, name: 1 });

    res.render("productAdd", { category: categoryName, admin: adminData });
  } catch (error) {
    console.log(error.message);
  }
};

// Insert Products

const addProduct = async (req, res) => {
  try {
    const adminData = req.session.adminData;

    const name = req.body.name;
    const image = [];
    const description = req.body.description;

    if (req.files) {
      for (let i = 1; i <= 4; i++) {
        const fieldName = `image${i}`;

        if (req.files[fieldName]) {
          const file = req.files[fieldName][0];
          const sharpImage = sharp(file.path);

          const metadata = await sharpImage.metadata();
          const width = metadata.width;
          const height = metadata.height;

          const aspectRatio = width / height;

          const targetSize = { width: 679, height: 679 };

          if (width > targetSize.width || height > targetSize.height) {
            sharpImage.resize({
              width: targetSize.width,
              height: targetSize.height,
              fit: "cover",
            });
          } else {
            sharpImage.resize(targetSize.width, targetSize.height);
          }

          const tempFilename = `${file.filename.replace(
            /\.\w+$/,
            ""
          )}_${Date.now()}.jpg`;

          const resizedImagePath = path.join(
            __dirname,
            "../public/productImages",
            tempFilename
          );

          await sharpImage.toFile(resizedImagePath);

          image.push(tempFilename);
        }
      }
    }

    const price = req.body.price;
    const quantity = req.body.quantity;
    const discountPrice = req.body.discountPrice;
    const color = req.body.color;
    const category = req.body.category;
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

    const existingProduct = await Product.findOne({
      name: name,
      modelName: seriesName,
    });
    const categoryName = await Category.find({}, { _id: 1, name: 1 });

    if (existingProduct) {
      const id = req.session.admin;
      const adminData = await User.findOne({ _id: id });
      res.render("productAdd", {
        error: "Product already exist",
        category: categoryName,
        admin: adminData,
      });
    } else {
      const product = new Product({
        name: name,
        price: price,
        discountPrice: discountPrice,
        image: image,
        brand: brand,
        description: description,
        modelName: seriesName,
        color: color,
        category: category,
        processorBrand: processorBrand,
        processorName: ProcessorName,
        processorGen: processorGen,
        ssd: ssd,
        ram: ram,
        ramType: ramType,
        clockSpeed: clockSpeed,
        graphicsCard: graphics,
        numberOfCores: noOfCores,

        quantity: quantity,
        is_touchScreen: touchScreen,
        screenSize: screenSize,
        screenType: screenType,
        is_fingerPrint: is_fingerPrint,
        is_webCam: is_webcam,
        is_backLit: is_backLit,
        is_listed: true,
      });

      const productData = await product.save();

      if (productData) {
        res.redirect("/admin/productList");
      } else {
        res.render("productAdd", {
          error: "Product cannot be added",
          category: categoryName,
          admin: adminData,
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

// product listing

const productList = async (req, res) => {
  try {
    const adminData = req.session.adminData;
    const page = parseInt(req.query.page) || 1;
    const productsPerPage = 5;
    let query = {};

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.status) {
      if (req.query.status === "listed") {
        query.is_listed = true;
      } else if (req.query.status === "unlisted") {
        query.is_listed = false;
      }
    }

    const totalCount = await Product.countDocuments(query);

    const totalPages = Math.ceil(totalCount / productsPerPage);

    const products = await Product.find(query)
      .skip((page - 1) * productsPerPage)
      .limit(productsPerPage)
      .sort({ date: -1 });

    const distinctCategories = await Product.distinct("category");

    res.render("productList", {
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

// Unlist Product

const unlistProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await Product.findById({ _id: id });

    if (!productData) {
      console.log("Product not found");
      res.redirect("/admin/productList");
      return;
    }

    if (productData.is_listed == false) {
      productData.is_listed = true;
    } else {
      productData.is_listed = false;
    }

    await productData.save();
    res.redirect("/admin/productList");
  } catch (error) {
    console.log(error.message);
  }
};

// Update Product page load

const editProductLoad = async (req, res) => {
  try {
    const adminData = req.session.adminData;
    const id = req.query.id;
    const categoryName = await Category.find({}, { _id: 1, name: 1 });

    const productData = await Product.findById({ _id: id });
    res.render("productEdit", {
      products: productData,
      category: categoryName,
      admin: adminData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// update Product

const updateProduct = async (req, res) => {
  try {
    const id = req.body.product_id;
    const updateData = await Product.findById(id);
    if (!updateData) {
      res.render("productEdit", { error: "User not found" });
    }

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
    if (req.body.deleteImages) {
      const imagesToDelete = req.body.deleteImages.split(",").map(Number);

      imagesToDelete.forEach((index) => {
        if (updateData.image[index]) {
          updateData.image.splice(index, 1);
        }
      });
    }

    for (let i = 1; i <= 4; i++) {
      const fieldName = `image${i}`;

      if (req.files && req.files[fieldName]) {
        const file = req.files[fieldName][0];

        const image = sharp(file.path);

        const metadata = await image.metadata();
        const width = metadata.width;
        const height = metadata.height;

        const targetSize = { width: 679, height: 679 };

        if (width > targetSize.width || height > targetSize.height) {
          image.resize({
            width: targetSize.width,
            height: targetSize.height,
            fit: "cover",
          });
        } else {
          image.resize(targetSize.width, targetSize.height);
        }

        const tempFilename = `${file.filename.replace(
          /\.\w+$/,
          ""
        )}_${Date.now()}.jpg`;
        const editedImagePath = path.join(
          __dirname,
          "../public/productImages",
          tempFilename
        );
        await image.toFile(editedImagePath);

        updateData.image[i - 1] = tempFilename;
      }
    }

    await updateData.save();
    res.redirect("/admin/productList");
  } catch (error) {
    console.log(error.message);
  }
};

const AdminViewProduct = async (req, res) => {
  try {
    const adminData = req.session.adminData;
    const id = req.query.id;
    const productData = await Product.findById(id);

    res.render("adminProductDetails", {
      products: productData,
      admin: adminData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//------------------------------------------- User side------------------------------------------------------

// User product listing

const UserLoadProducts = async (req, res) => {
  try {
    const userData = req.session.userData;
    const page = parseInt(req.query.page) || 1;
    const searchQuery = req.query.search;

    const productsPerPage = 5;
    let query = { is_listed: true };

    const priceRanges = {
      under25K: { min: 0, max: 25000 },
      "25Kto50K": { min: 25000, max: 50000 },
      "50Kto100K": { min: 50000, max: 100000 },
      "100Kto200K": { min: 100000, max: 200000 },
      "200Kabove": { min: 200000, max: Number.MAX_VALUE },
    };
    if (searchQuery) {
      query.name = { $regex: new RegExp(searchQuery, "i") };
    }
    if (req.query.price && priceRanges[req.query.price]) {
      const { min, max } = priceRanges[req.query.price];
      query.price = { $gte: min, $lte: max };
    }

    if (req.query.category) {
      query.category =
        {
          $in: Array.isArray(req.query.category)
            ? req.query.category
            : [req.query.category],
        } || "";
    }

    if (req.query.brands) {
      query.brand =
        {
          $in: Array.isArray(req.query.brands)
            ? req.query.brands
            : [req.query.brands],
        } || "";
    }

    if (req.query.ram) {
      query.ram =
        {
          $in: Array.isArray(req.query.ram) ? req.query.ram : [req.query.ram],
        } || "";
    }

    if (req.query.ssd) {
      query.ssd =
        {
          $in: Array.isArray(req.query.ssd) ? req.query.ssd : [req.query.ssd],
        } || "";
    }

    if (req.query.processor) {
      query.processor =
        {
          $in: Array.isArray(req.query.processor)
            ? req.query.processor
            : [req.query.processor],
        } || "";
    }

    if (req.query.graphicsCard) {
      query.graphicsCard =
        {
          $in: Array.isArray(req.query.graphicsCard)
            ? req.query.graphicsCard
            : [req.query.graphicsCard],
        } || "";
    }

    if (req.query.screenSize) {
      query.screenSize =
        {
          $in: Array.isArray(req.query.screenSize)
            ? req.query.screenSize
            : [req.query.screenSize],
        } || "";
    }

    const totalCount = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalCount / productsPerPage);

    const distinctValues = (
      await Product.aggregate([
        {
          $group: {
            _id: null,
            categories: { $addToSet: "$category" },
            brands: { $addToSet: "$brand" },
            ram: { $addToSet: "$ram" },
            ssd: { $addToSet: "$ssd" },
            processor: { $addToSet: "$processorBrand" },
            graphicsCard: { $addToSet: "$graphicsCard" },
            screenSize: { $addToSet: "$screenSize" },
          },
        },
      ])
    ).shift();
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

    res.render("productShop", {
      products,
      User: userData,
      totalPages,
      currentPage: page,
      distinctValues: distinctCategories,
      req,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// User product Details

const UserViewProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await Product.findById(id);
    const sameProducts = await Product.find({
      is_listed: true,
      category: productData.category,
      _id: { $ne: id },
    }).limit(7);
    const userData = req.session.userData;
    res.render("productView", {
      product: productData,
      User: userData,
      sameProducts: sameProducts,
    });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  LoadProductAdd,
  addProduct,
  productList,
  AdminViewProduct,
  unlistProduct,
  editProductLoad,
  updateProduct,
  UserLoadProducts,
  UserViewProduct,
};
