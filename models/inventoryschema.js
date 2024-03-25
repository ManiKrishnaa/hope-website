const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/hope')

const inventoryschema = new mongoose.Schema({
    itemname : {type : String,required : true},
    itemlevel : {type : String,required : true}
});

module.exports = mongoose.model('inventoryschema',inventoryschema);