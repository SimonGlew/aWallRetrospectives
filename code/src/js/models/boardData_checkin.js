var mongoose = require('mongoose');

let checkInSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'session',
        required: true
    },
    data: [{
        user: String,
        value: mongoose.Schema.Types.Mixed
    }]
});

module.exports = mongoose.model('boardData_checkin', checkInSchema); 