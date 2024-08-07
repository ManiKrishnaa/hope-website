const mongoose = require('mongoose');

const orgschema = new mongoose.Schema({
    orgname: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    orgemail: { type: String, required: true, unique: true },
    orgmobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true }
});

module.exports = mongoose.model('orgschema', orgschema);
