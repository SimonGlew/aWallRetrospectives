var mongoose = require('mongoose');

let ConfigSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        index: true
    },
    data: {
        type: Object
    }
});

module.exports = mongoose.model('config', ConfigSchema); 