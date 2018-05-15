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
        type: String
    },
    active: {
        type: Boolean,
        default: true
    },
    retrospectiveType: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'retrospectiveType'
    },
    members: {
        type: [String]
    },
    currentState: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'retrospectiveType',
        required: true
    }
});

sessionSchema.index({ project: 1, sprint: 1 }, { unique: true });

module.exports = mongoose.model('session', sessionSchema); 