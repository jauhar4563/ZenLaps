const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const userRoute = require("./routers/userRoutes/userRoute");
const adminRoute = require("./routers/adminRoutes/adminRoute");
const userAuthRoutes = require("./routers/userRoutes/userAuthRoutes");
require("dotenv").config();
mongoose.connect("mongodb://localhost:27017/ZenLaps");

const app = express();

// set view engine
app.set("view engine", "ejs");

// use public directory as static
app.use(express.static("public"));
app.use("assets/css", express.static(__dirname + "public"));
app.use("/public", express.static("public", { extensions: ["js"] }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  })
);

//routes

// user Route
app.use(userRoute);

// User Authenticated Routes
app.use(userAuthRoutes);

// admin Routes
app.use("/admin", adminRoute);

// Error page for 404 error
app.use((req, res, next) => {
  res.status(404).render("./user/404Error", { User: null });
});

// port
app.listen(3000, () => {
  console.log("server is running...@ http://localhost:3000/");
});
