var mongoose = require('mongoose');

let ThreeWSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'session',
        required: true,
        index: true
    },
    data: {
        type: Object
    },
    active: {
    	type: Boolean,
    	default: true
    },
    carryOver: {
        type: [mongoose.Schema.Types.ObjectId], 
        ref: 'session',
    },
    completed: {
        type: Boolean
    }
});

module.exports = mongoose.model('boardData_3w', ThreeWSchema); 