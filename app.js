const express = require('express')
const path = require('path')
const passport = require('passport')
const flash = require('connect-flash')
const methodOverride = require('method-override')
const session = require('express-session')
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const multer = require('multer')


const app = express()

//Defining port  both prod and local
const port = process.env.PORT || 3001

//passport config 
require('./config/passport')(passport)
    //Connecting to db
mongoose.connect('mongodb://127.0.0.1/Car_Review_Blog', { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => {
        console.log("Connected")
    }).catch((err) => {
        console.log("Database Down")
    });
mongoose.set('useCreateIndex', true)
    //Definiing Static Path
const public_Dir = path.join(__dirname, './public')
app.use(express.static(public_Dir))

//BodyParser
app.use(express.urlencoded({ extended: false }))
app.set('view engine', 'ejs')
app.use(methodOverride('_method'))
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true }
}))

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Multer  Image Saver

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

var upload = multer({ storage: storage });


//connect Flash
app.use(flash())

// Global Vars 

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    next()
})

//Routes
// app.use('/', routes);
app.use('/', require('./routes/admin'))
app.use('/', require('./routes/blog'))

app.listen(port, (error, result) => {
    if (error) {
        return console.log('Error while trying to connect')
    }

    console.log('Successfully connect on port ' + port)
})