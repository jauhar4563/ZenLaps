const User = require("../models/userModel.js");
const bcrypt = require("bcrypt");
const {} = require("../helpers/helper");
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
    const adminData = req.session.adminData;
    res.render("home", { admin: adminData });
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
