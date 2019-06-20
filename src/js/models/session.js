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
    },
    startDate: {
        type: Date,
        default: Date.now()
    },
    endDate: {
        type: Date,
        default: Date.now()
    },
    retrospectiveType: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'retrospectiveType',
        required: true
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