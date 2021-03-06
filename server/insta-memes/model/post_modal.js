const mongoose = require("mongoose");

var schema = new mongoose.Schema({
    description: {
        type: String,
        required: false,
    },
    posted_by_id: {
        type: String,
        required: true,
    },
    posted_by: {
        type: String,
        required: true,
    },
    images: {
        type: String,
        required: true,
    },
    images_url: {
        type: String,
        required: true,
    },
    date: String,
     time: String,
     dim:[],
     likes:[],
     comments:[]

});




const Post = mongoose.model("post", schema);

module.exports = Post;
