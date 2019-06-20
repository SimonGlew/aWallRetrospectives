var mongoose = require('mongoose');

let checkInSchema = new mongoose.Schema({
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

checkInSchema.statics.download = function (sessionId) {
    return mongoose.model('boardData_checkin').aggregate([
        { $match: { session: mongoose.Types.ObjectId(sessionId) } },
        { $project: { _id: 0, name: '$data.name', vote: '$data.data' } }
    ])
        .then(data => {
            let total = 0, output = { votes: [], average: 0 }

            data.forEach(vote => {
                total += vote.vote 
                output.votes.push(vote)
            })
            output.average = output.votes.length == 0 ? 0 : parseFloat((total / output.votes.length).toFixed(2))

            return output
        })
}

module.exports = mongoose.model('boardData_checkin', checkInSchema); 