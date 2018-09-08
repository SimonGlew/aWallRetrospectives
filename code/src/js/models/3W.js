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

ThreeWSchema.statics.download = function (sessionId) {
    let nonActions = mongoose.model('boardData_3ws').aggregate([
        { $match: { session: mongoose.Types.ObjectId(sessionId) } },
        { $match: { 'data.data.type': { $ne: 'action' } } },
        { $project: { _id: 0, name: '$data.name', type: '$data.data.type', message: '$data.data.message' } }
    ])
    let actions = mongoose.model('boardData_3ws').aggregate([
        { $match: { session: mongoose.Types.ObjectId(sessionId) } },
        { $match: { 'data.data.type': { $eq: 'action' } } },
        { $project: { _id: 0, name: '$data.name', message: '$data.data.message' } }
    ])
    
    return Promise.all([
        nonActions,
        actions
    ])
        .then(([nonActions, actions]) => {
            return { cards: nonActions, actions: actions }
        })
}

module.exports = mongoose.model('boardData_3ws', ThreeWSchema); 