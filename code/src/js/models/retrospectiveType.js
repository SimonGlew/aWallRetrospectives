var mongoose = require('mongoose');

let retrospectiveTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true
    },
    length: {
        type: Number
    },
    mainRetro: {
        type: Boolean
    },
    startRetro: {
        type: Boolean
    },
    endRetro: {
        type: Boolean
    }
});

module.exports = mongoose.model('retrospectiveType', retrospectiveTypeSchema); 