const express = require('express')
const session = require('express-session')
const mongoose=require('mongoose')
const userRoute = require('./routers/userRoutes/userRoute');
const adminRoute = require('./routers/adminRoutes/adminRoute')
// const nocache = require('nocache')

mongoose.connect("mongodb://localhost:27017/ZenLaps")

const app = express();

app.set('view engine','ejs')
// app.use(nocache())

app.use(express.static('public'))
app.use('assets/css',express.static(__dirname+'public'))
app.use("/public", express.static("public", { "extensions": ["js"] }));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret: 'your_session_secret',
    resave: false,
    saveUninitialized: true,
    
}));

// for user routes
app.use(userRoute)
app.use('/admin',adminRoute)
// for admin routes
// app.use('/admin',adminRoute);

app.listen(3000,()=>{
    console.log("server is running...@ http://localhost:3000/")

})