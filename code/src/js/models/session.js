var mongoose = require('mongoose');

let sessionSchema = new mongoose.Schema({
    project: {
        type: String,
        required: true,
        index: true
    },
    sprint: {
        type: String,
        index: true
    },
    name: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    }
});

sessionSchema.index({ project: 1, sprint: 1 }, { unique: true });

module.exports = mongoose.model('session', sessionSchema); 