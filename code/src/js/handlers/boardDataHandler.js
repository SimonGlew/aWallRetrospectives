const mongoose = require('mongoose')

const CheckIn = require('../models/boardData_checkin'),
    ThreeW = require('../models/3W')

function saveCheckin(data, sessionId) {
    return CheckIn.findOne({session: sessionId, 'data.name': data.name })
        .lean()
        .then(res => {
            if(!res){
                return new CheckIn({
                    session: sessionId,
                    data: data
                }).save()
            }else{
                //update vote
                return CheckIn.update({ _id: res._id }, { $set: { 'data.data': data.data } })
            }
        })
}

function saveCard(data, sessionId){
    return new ThreeW({ session: sessionId, data: data }).save()
}

function getCheckinData(sessionIds) {
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
    saveCard: saveCard,
    getCheckinData: getCheckinData
}