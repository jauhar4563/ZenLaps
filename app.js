const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const userRoute = require("./routers/userRoutes/userRoute");
const adminRoute = require("./routers/adminRoutes/adminRoute");
const userAuthRoutes = require("./routers/userRoutes/userAuthRoutes");
require("dotenv").config();
const {PORT, DB_URL} = process.env || 3000;
mongoose.connect(DB_URL).then((e)=>console.log('Mongo connected sucessfully'));

 
const app = express();

// set view engine
app.set("view engine", "ejs");

// use Public directory as static
app.use(express.static("Public"));
app.use("assets/css", express.static(__dirname + "Public"));
app.use("/Public", express.static("Public", { extensions: ["js"] }));



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
app.listen(PORT, () => {
  console.log("server is running...@ http://localhost:3000/");
});
