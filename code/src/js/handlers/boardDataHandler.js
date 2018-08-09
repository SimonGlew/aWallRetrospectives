const mongoose = require('mongoose')

const CheckIn = require('../models/boardData_checkin'),
ThreeW = require('../models/3W'),
EndCard = require('../models/endCard'),
TimelineMetadata = require('../models/timelineMetadata')

const SessionHandler = require('../handlers/sessionHandler')

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

function getCheckinData(sessionIds, currentSessionId) {
    return CheckIn.find({ session: currentSessionId })
    .lean()
    .then(sessionData => {
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
        .then(allSessionData => {
            return { sprintData: sessionData, allData: allSessionData }
        })
    })
    
}

function getAllCards(sessionId){
    return SessionHandler.getPreviousSprintSession(sessionId)
    .then(sesId => {
        return Promise.all([
            ThreeW.find({session: sessionId, active: { $ne: false }}).lean(),
            sesId ? ThreeW.find({carryOver: sesId, active: { $ne: false }}).lean() : Promise.resolve([]),
            ])
        .then(([cards, carryOver]) => {

            let obj = { nonA: [], A: [] }

            cards.forEach(card => {
                if(card.data.data.type != 'action'){
                    obj.nonA.push({ _id: card._id, name: card.data.name, data: card.data, active: card.active, completed: card.completed })
                }else{
                    obj.A.push({ _id: card._id, name: card.data.name, data: card.data, carryOver: card.carryOver, active: card.active, completed: card.completed })
                }
            })
            carryOver.forEach(card => {
                obj.A.push({ _id: card._id, name: card.data.name, data: card.data, active: card.active, completed: card.completed, carryOver: card.carryOver, carriedOver: true })
            })
            return obj
        })
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

function carryonCard(cardId, sessionId){
    console.log('CARRY OVER_', cardId)
    return ThreeW.findOne({ _id: cardId })
    .then(card => {
        if(card){
            console.log('card', card)
            if(card.carryOver.map(r => String(r)).indexOf(String(sessionId)) == -1){
                card.carryOver.push(sessionId)
                console.log('carry over array', card.carryOver)
                return card.save()
            }
        }
    })
}

function completeCard(cardId){
    outputToLog('completeCard: ' + cardId, null)
    return ThreeW.findOne({ _id: cardId })
    .then(card => {
        if(card){
            card.completed = !card.completed
            return card.save()
        }
    })
}

function saveEndCard(data, sessionId){
    return new EndCard({
        session: sessionId,
        data: data
    }).save()
}

function setTimelineMetadata(sessionId, map){
    return TimelineMetadata.findOne({ session: sessionId })
    .lean()
    .then(res => {
        if(!res){
            return new TimelineMetadata({
                session: sessionId,
                map: map
            }).save()
        }else{
            return TimelineMetadata.update({ _id: res._id }, { $set: { 'map': map } })
        }
    })
}

function getEndCards(sessionId){
    return EndCard.find({ session: sessionId }).lean()
        .then(data => data)
}

module.exports = {
    saveCheckin: saveCheckin,
    saveCard: saveCard,
    saveEndCard: saveEndCard,

    getCheckinData: getCheckinData,
    getAllCards: getAllCards,
    getEndCards: getEndCards,

    inactiveCard: inactiveCard,
    carryonCard: carryonCard,
    completeCard: completeCard,

    setTimelineMetadata: setTimelineMetadata
}