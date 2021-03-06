const mongoose = require("mongoose");

var schema = new mongoose.Schema({
    id_user : String,
    sender_notif :String,
    notif : [],
    seen : '',
    
});

const Notif = mongoose.model("notif", schema);
module.exports = Notif;
