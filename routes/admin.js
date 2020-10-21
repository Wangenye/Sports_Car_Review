const express = require('express')
const passport = require('passport')
const bcrypt = require('bcrypt')
const Admin = require('../models/Admin')
const Blog = require('../models/Blog')
const { ensureAuthenticated } = require('../config/auth')
const router = express.Router()



router.get('/', async(req, res) => {
    const articles = await Blog.find().sort({ createdAt: 'desc' })
    res.render("blog/index.ejs", {
        articles: articles,
        blogname: "Car Review",
        theme: "Check Out Reviews On bests SportsCars "
    })
})

router.get('/admin_Dashboard', ensureAuthenticated, async(req, res) => {
    const articles = await Blog.find().sort({ createdAt: 'desc' })
    res.render('admin/dashboard.ejs', { articles: articles })
})
router.get('/register', (req, res) => {
    res.render('admin/register.ejs')
})

router.get('/login', (req, res) => {
    res.render('admin/login')
})


//Register Handler
router.post('/register', (req, res) => {

        const { name, email, password, password2 } = req.body

        let errors = []
            //Check Required fields
        if (!name || !email || !password || !password2) {
            errors.push({
                msg: 'Please Fill in All fields '
            })

        }
        if (password !== password2) {
            errors.push({
                msg: 'Passwords Do not Match'
            })
        }

        //pass Length
        if (password.length < 6) {
            errors.push({
                msg: 'Password should be Atleast 6 Characteers'
            })
        }

        if (errors.length > 0) {
            res.render('./admin/register', {
                errors,
                name,
                email,
                password,
                password2
            })
        } else {
            //validation passed
            Admin.findOne({ email: email })
                .then((user) => {
                    if (user) {
                        errors.push({
                            msg: 'Email is already registered'
                        })
                        res.render('./admin/register', {
                            errors,
                            name,
                            email,
                            password,
                            password2
                        })
                    } else {
                        //Encrypt password

                        const newUser = new Admin({
                            name,
                            email,
                            password,
                        })
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(newUser.password, salt, (err, hash) => {
                                if (err) throw err;

                                newUser.password = hash
                                newUser.save().then((user) => {
                                    req.flash('success_msg', "Registered, You Can Log In")
                                    res.redirect('/login')
                                }).catch((err) => {
                                    console.log('mm')
                                    req.flash('error_msg', "BJHDgljkashf;uiehf;o")
                                });
                            })
                        })


                    }
                }).catch((err) => {

                })
        }
    })
    // Login handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/admin_Dashboard',
        failureRedirect: '/login',
        failureFlash: true,

    })(req, res, next)

})


router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success_msg', "Logged Out")
    res.redirect('/login')
})


module.exports = router