var mongoose = require('mongoose');

let endCardSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'session',
        required: true,
        index: true
    },
    data: {
        type: Object
    }
});

endCardSchema.statics.download = function (sessionId) {
    let plus = mongoose.model('endCard').aggregate([
        { $match: { session: mongoose.Types.ObjectId(sessionId) } },
        { $match: { 'data.data.type': { $eq: 'plus' } } },
        { $project: { _id: 0, name: '$data.name', message: '$data.data.message' } }
    ])
    let delta = mongoose.model('endCard').aggregate([
        { $match: { session: mongoose.Types.ObjectId(sessionId) } },
        { $match: { 'data.data.type': { $eq: 'delta' } } },
        { $project: { _id: 0, name: '$data.name', message: '$data.data.message' } }
    ])

    return Promise.all([
        plus,
        delta
    ])
        .then(([plus, delta]) => {
            return { plus: plus, delta: delta }
        })
}

module.exports = mongoose.model('endCard', endCardSchema); 