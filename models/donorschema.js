const express = require('express');
const mongoose = require('mongoose');

const donorschema = new mongoose.Schema({
    name : {type : String,required : true},
    username : {type : String,required : true,unique : true},
    email : {type : String,required : true,unique : true},
    mobile : {type : String,required : true,unique : true},
    password : {type : String,required : true},
    role : {type : String,required : true}
});

module.exports = mongoose.model('donorschema',donorschema);
