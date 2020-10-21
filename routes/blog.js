const fs = require('fs')
const path = require('path')
const multer = require('multer')
const express = require('express')
const Blog = require('../models/Blog')
require('dotenv/config');
// const upload = require('../config/upload ')
const { ensureAuthenticated } = require('../config/auth')

const router = express.Router()

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init Upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('myImage');

// Check File Type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}
///////////////////////////


router.get('/new_post', ensureAuthenticated, (req, res) => {
    res.render("blog/new", { article: new Blog() })
})

router.get('/show/:id', ensureAuthenticated, async(req, res) => {

    const article = await Blog.findById(req.params.id)
    res.render('blog/show', { article: article, blogname: "Car Review", })
})

router.put('/:id', ensureAuthenticated, async(req, res, next) => {
    const article = await new Blog({
        _id: req.params.id,
        title: req.body.title,
        author: req.body.author,
        description: req.body.description,
        post: req.body.post,
        imagePost: req.file.path
    })
    Blog.updateOne({ _id: req.params.id },
        article).then((result) => {
        res.redirect('/admin_Dashboard')
        console.log('Successs')
    }).catch((err) => {
        // console.log(err)
    });

});

// router.get('/:slug', async(req, res) => {
//     const article = await Blog.findOne({ slug: req.params.slug })

//     if (article == null) res.redirect('/admin_Dashboard')
//     res.render('./blog/show', { article: article })
// })

router.post('/new_post', ensureAuthenticated, (req, res) => {
    // var obj = {
    //     imagePost: {
    //         data: fs.readFileSync(__dirname + '/uploads/' + imagePost),
    //         contentType: 'image/png'
    //     }
    // }
    const newPost = new Blog(req.body)
    newPost.save().then((result) => {
        console.log(result)
        res.redirect('/admin_Dashboard')
    }).catch((err) => {
        console.log('ERRROOOR', err)
    });
})

router.delete('/:id', ensureAuthenticated, async(req, res) => {
    await Blog.findByIdAndDelete(req.params.id)

    res.redirect('/admin_Dashboard')
})

// Viewers Routes 

router.get('/post/:slug', async(req, res) => {
    const article = await Blog.findOne({ slug: req.params.slug })
    if (article == null) res.redirect('/')
    res.render('blog/post', { article: article, blogname: "Car Review", })
})
router.get('/contact', (req, res) => {
    res.render('blog/contact', { blogname: "Car Review", })
})
router.get('/about', (req, res) => {
    res.render('blog/about', { blogname: "Car Review", })
})


module.exports = router