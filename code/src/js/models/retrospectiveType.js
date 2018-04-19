var mongoose = require('mongoose');

let retrospectiveTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true
    }
});

module.exports = mongoose.model('retrospectiveType', retrospectiveTypeSchema); 