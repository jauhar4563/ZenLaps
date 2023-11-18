const User = require("../models/userModel.js");
const bcrypt = require("bcrypt");
const {} = require("../helpers/helper");
const Order =require('../models/orderModel')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const { getMonthlyDataArray, getDailyDataArray, getYearlyDataArray } = require('../helpers/chartDate');

require("dotenv").config();

// Admin Login

const loadLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

// Verify Admin

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const adminData = await User.findOne({ email: email });
    if (adminData) {
      const passwordMach = await bcrypt.compare(password, adminData.password);
      if (passwordMach) {
        if (adminData.is_superAdmin == 1) {
          req.session.adminData = adminData;
          req.session.admin = adminData.id;
          res.redirect("/admin/home");
        } else {
          res.render("login", { error: "You are not authorised to login" });
        }
      } else {
        res.render("login", { error: "Email and password is incorrect" });
      }
    } else {
      res.render("login", { error: "Email and password is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// Admin dashboard Load

const loadHome = async (req, res) => {
  try {
    const [totalRevenue, totalUsers, totalOrders, totalProducts,totalCategories, orders, monthlyEarnings, newUsers] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: "Payment Successful" } },
        { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } },
      ]),
      User.countDocuments({ is_blocked: false, is_verified: true }),
      Order.countDocuments(),
      Product.countDocuments(),
      Category.countDocuments(),
      Order.find().limit(10).sort({ orderDate: -1 }),
      Order.aggregate([
        {
          $match: {
            paymentStatus: "Payment Successful",
            orderDate: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
          },
        },
        { $group: { _id: null, monthlyAmount: { $sum: "$totalAmount" } } },
      ]),
      User.find({is_blocked: false, is_verified: true }).sort({date:-1}).limit(5)
      
      
          ]);

    const adminData = req.session.adminData;
    const totalRevenueValue = totalRevenue.length > 0 ? totalRevenue[0].totalAmount : 0;
    const monthlyEarningsValue = monthlyEarnings.length > 0 ? monthlyEarnings[0].monthlyAmount : 0;
    // Get monthly data
    const monthlyDataArray =await getMonthlyDataArray();

    // Get daily data
    const dailyDataArray =await getDailyDataArray();

    // Get yearly data
    const yearlyDataArray =await getYearlyDataArray();

    res.render("home", {
      admin: adminData,
      orders,
      newUsers,
      totalRevenue: totalRevenueValue,
      totalOrders,
      totalProducts,
      totalCategories,
      totalUsers,
      monthlyEarnings: monthlyEarningsValue,
      monthlyMonths: monthlyDataArray.map(item => item.month),
      monthlyOrderCounts: monthlyDataArray.map(item => item.count),
      dailyDays: dailyDataArray.map(item => item.day),
      dailyOrderCounts: dailyDataArray.map(item => item.count),
      yearlyYears: yearlyDataArray.map(item => item.year),
      yearlyOrderCounts: yearlyDataArray.map(item => item.count),
    });
  } catch (error) {
    console.log(error.message);
  }
};


// user list

const userList = async (req, res) => {
  try {
    const adminData = req.session.adminData;
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    let query = { is_superAdmin: false };

    if (req.query.status) {
      if (req.query.status === "blocked") {
        query.is_blocked = true;
      } else if (req.query.status === "unblocked") {
        query.is_blocked = false;
      }
    }

    const totalCount = await User.countDocuments(query);

    const totalPages = Math.ceil(totalCount / limit);

    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdDate: -1 });

    res.render("userList", {
      users,
      admin: adminData,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// User Block , unblock

const blockUser = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findById({ _id: id });

    if (userData.is_blocked === 0) {
      userData.is_blocked = 1;
      if (req.session.userData) delete req.session.userData;
    } else {
      userData.is_blocked = 0;
    }

    await userData.save();
    res.redirect("/admin/userList");
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin Logout

const logout = async (req, res) => {
  try {
    delete req.session.admin;
    delete req.session.adminData;
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadLogin,
  verifyLogin,
  loadHome,
  logout,
  userList,
  blockUser,
};
