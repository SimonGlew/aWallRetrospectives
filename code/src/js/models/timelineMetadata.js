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

module.exports = mongoose.model('timeline_metadata', timelineSchema); 