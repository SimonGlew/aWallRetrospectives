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

module.exports = mongoose.model('boardData_checkin', checkInSchema); 