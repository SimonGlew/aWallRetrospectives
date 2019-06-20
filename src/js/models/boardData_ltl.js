var mongoose = require('mongoose');

let LikeToLikeSchema = new mongoose.Schema({
	generatedId: {
    	type: String,
    	required: true,
    	index: true
    },
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'session',
        required: true,
        index: true
    },
    name: {
    	type: String
    },
    generated: {
    	type: Date
    },
    type: {
    	type: String
    },
    message: {
    	type: String
    }
});

LikeToLikeSchema.statics.download = function (sessionId) {
    return mongoose.model('boardData_ltl').aggregate([
        { $match: { session: mongoose.Types.ObjectId(sessionId) } },
        { $project: { _id: 0, name: '$name', type: '$type', message: '$message' } }
    ])
}

module.exports = mongoose.model('boardData_ltl', LikeToLikeSchema); 