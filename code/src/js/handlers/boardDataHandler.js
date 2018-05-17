const mongoose = require('mongoose')

const CheckIn = require('../models/boardData_checkin')

function saveCheckin(data, sessionId) {
    return new CheckIn({
        session: sessionId,
        data: data
    }).save()
}

function getCheckinData(sessionIds) {
    console.log(sessionIds)
    return CheckIn.aggregate([
        { $match: { session: { $in: sessionIds.map(id => mongoose.Types.ObjectId(id)) } } },
        {
            $lookup: {
                from: 'sessions',
                localField: 'session',
                foreignField: '_id',
                as: 'sessionObj'
            }
        },
        { $unwind: '$sessionObj' },
        { $project: { sessionId: '$session', session: { projectName: '$sessionObj.project', sprint: '$sessionObj.sprint' }, data: '$data' } },
        { $group: { _id: '$sessionId', session: { $first: '$session' }, data: { $push:  { data: '$data' } } } }
    ])
}

module.exports = {
    saveCheckin: saveCheckin,
    getCheckinData: getCheckinData
}