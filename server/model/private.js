const mongoose = require("mongoose");

var schema = new mongoose.Schema({
    id_conv: {
        type: String,
        required: true,
    },
    messages : [],
    users :[]
});




const Private = mongoose.model("Private", schema);

module.exports = Private;
