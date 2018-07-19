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

function getAllCards(sessionId){
    return ThreeW.find({session: sessionId, active: { $ne: false }})
    .lean()
    .then(cards => {
        let obj = { nonA: [], A: [] }

        cards.forEach(card => {
            if(card.data.data.type != 'action'){
                obj.nonA.push({ _id: card._id, name: card.data.name, data: card.data, active: card.active, carryon: card.carryOver, completed: card.completed })
            }else{
                obj.A.push({ _id: card._id, name: card.data.name, data: card.data, active: card.active, carryon: card.carryOver, completed: card.completed })
            }
        })

        return obj
    })
}

function inactiveCard(cardId){
    return ThreeW.findOne({ _id: cardId })
    .then(card => {
        if(card){
            card.active = false
            return card.save()
        }
    })
}

function carryonCard(cardId){
    return ThreeW.findOne({ _id: cardId })
    .then(card => {
        if(card){
            card.carryOver = !card.carryOver
            return card.save() 
        }
    })
}

function completeCard(cardId){
    outputToLog('completeCard: ' + cardId, null)
    return ThreeW.findOne({ _id: cardId })
    .then(card => {
        if(card){
            outputToLog('completeCard: ' + cardId, null)
            card.completed = !card.completed
            return card.save()
        }
    })
}

module.exports = {
    saveCheckin: saveCheckin,
    saveCard: saveCard,
    getCheckinData: getCheckinData,
    getAllCards: getAllCards,
    inactiveCard: inactiveCard,
    carryonCard: carryonCard,
    completeCard: completeCard
}