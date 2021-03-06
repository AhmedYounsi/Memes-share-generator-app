const mongoose = require("mongoose");

var schema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
    },
    id_room: {
        type: String,
        required: true,
    },
    sender: {
        type: String,
        required: true,
    },
    date: Date
});




const Post = mongoose.model("message", schema);

module.exports = Post;
