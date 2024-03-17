const express = require('express');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/hope')

const donorschema = new mongoose.Schema({
    name : {type : String,required : true},
    username : {type : String,required : true,unique : true},
    email : {type : String,required : true,unique : true},
    mobile : {type : String,required : true,unique : true},
    password : {type : String,required : true},
    role : {type : String,required : true}
});

module.exports = mongoose.model('donorschema',donorschema);
