const mongoose = require('mongoose')
const slugify = require("slugify");

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    post: {
        type: String,
        required: true
    },
    imagePost: {
        data: Buffer,
        contentType: String
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },

})

BlogSchema.pre("validate", function(next) {
    if (this.title) {
        this.slug = slugify(this.title, {
            lower: true,
            strict: true,
        });
    }

    next();
});


const Blog = mongoose.model('Blog', BlogSchema)

module.exports = Blog