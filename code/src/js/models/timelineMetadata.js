var mongoose = require('mongoose');

let timelineSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'session',
        required: true,
        index: true
    },
    map: {
        type: Object
    }
});

timelineSchema.statics.download = function(sessionId){
    return mongoose.model('timeline_metadata').aggregate([
        { $match: { session: mongoose.Types.ObjectId(sessionId) } },
        { $project: { _id: 0, colorMap: '$map' } }
    ])
}

module.exports = mongoose.model('timeline_metadata', timelineSchema); 