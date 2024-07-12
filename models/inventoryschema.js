const mongoose = require('mongoose');

const inventoryschema = new mongoose.Schema({
    itemname : {type : String,required : true},
    itemlevel : {type : String,required : true}
});

module.exports = mongoose.model('inventoryschema',inventoryschema);
