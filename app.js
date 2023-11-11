const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const nocache = require('nocache')
const userRoute = require("./routers/userRoutes/userRoute");
const adminRoute = require("./routers/adminRoutes/adminRoute");
mongoose.connect("mongodb://localhost:27017/ZenLaps");
require("dotenv").config();


const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use("assets/css", express.static(__dirname + "public"));
app.use("/public", express.static("public", { extensions: ["js"] }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret:  process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(nocache())

// for user routes
app.use(userRoute);
app.use("/admin", adminRoute);

app.listen(3000, () => {
  console.log("server is running...@ http://localhost:3000/");
});
