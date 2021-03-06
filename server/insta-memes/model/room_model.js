const mongoose = require("mongoose");

var schema = new mongoose.Schema({
    room_name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
    },
    user:{
        type: Array
    },
    room_id:{
        type: String,
        required: true,
    }
    
});




const Room = mongoose.model("room", schema);

module.exports = Room;
