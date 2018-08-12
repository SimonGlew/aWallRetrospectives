var mongoose = require('mongoose');

let LikeToLikeRoundSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'session',
        required: true,
        index: true
    },
    qualityCard: {
    	type: String
    },
    winnerCard: {
    	type: mongoose.Schema.Types.ObjectId,
        ref: 'boardData_ltl',
    },
    otherCards: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'boardData_ltl',
    },
});

module.exports = mongoose.model('boardData_ltlRound', LikeToLikeRoundSchema); 