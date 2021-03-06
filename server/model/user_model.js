const mongoose = require("mongoose");

var schema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    request:[],
    friends:[],
    
});




const Username = mongoose.model("username", schema);

module.exports = Username;
