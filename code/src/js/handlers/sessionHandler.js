const Session = require('../models/session'),
RetrospectiveType = require('../models/retrospectiveType')

function createSession(projectName, sprintNumber, boardName, password, rType) {
    return Session.count({ project: projectName, sprint: sprintNumber })
    .lean()
    .then(count => {
        if (!!count) return { err: 'Session already exists' };

        outputToLog(projectName + ' attempting to create new board ' + boardName + ' for sprint ' + sprintNumber, null)
        return RetrospectiveType.findOne({ name: 'Check-in' }, '_id').lean()
        .then(retroType => {
            return new Session({
                project: projectName,
                sprint: sprintNumber,
                name: boardName,
                password: password,
                retrospectiveType: rType,
                active: true,
                members: [],
                currentState: retroType._id
            }).save()
            .then(session => {
                return joinSession(projectName, sprintNumber, "moderator", password)
            })
        })
    })
}

function joinSession(projectName, sprintNumber, username, password) {
    outputToLog(username + ' attempted to join ' + projectName +  ' sprint ' + sprintNumber, username)
    return Session.findOne({ project: projectName, sprint: sprintNumber, password: password, active: true }, '_id retrospectiveType members')
    .populate('retrospectiveType', 'name')
    .then(session => {
        if (!session) return { err: 'Cannot find session with parameters' };

        if (username != 'mod') {
            let found = session.members.filter(member => username == member)

            if (found.length) return { err: 'Username is already used' };
        }

        return session.save();
    });
}

function addMember(sessionId, member) {
    return Session.findOne({ _id: sessionId })
    .then(session => {
        if (!session) return;

        if (!session.members) session.members = []

            session.members.push(member);
        return session.save().then(session => session.members)
    })
}

function removeMember(sessionId, member) {
    return Session.findOne({ _id: sessionId })
    .then(session => {
        if (!session) return;

        if (!session.members) session.members = []

            session.members = session.members.filter(m => m != member)

        return session.save().then(session => session.members)
    })
}

function removeAllMembers(sessionId){
    return Session.findOne({ _id: sessionId })
    .then(session => {
        session.members = []
        return session.save()
    })
}

function getMetadata(sessionId) {
    return Promise.all([
        RetrospectiveType.findOne({startRetro : true}, 'length').lean(),
        RetrospectiveType.findOne({endRetro: true}, 'length').lean()
        ])
    .then(([start, end]) => {
        return Session.findOne({ _id: sessionId })
        .populate('retrospectiveType', 'name length')
        .populate('currentState', 'name length')
        .lean()
        .then(data => {
            data.totalTime = start.length + end.length + data.retrospectiveType.length
            return data
        })
    })
    
    
}

function getSprintSessionsFromId(sessionId) {
    return Session.findOne({ _id: sessionId }, 'project')
    .lean()
    .then(projectName => {
        return Session.find({ project: projectName.project }, '_id')
        .lean()
        .then(sessionIds => sessionIds.map(sessionId => sessionId._id))
    })
}

function getPreviousSprintSession(sessionId){
    return Session.findOne({ _id: sessionId })
    .lean()
    .then(session => {
        return Session.findOne({ project: session.project, sprint: (session.sprint - 1) }, '_id')
        .lean()
        .then(prevSession => {
            return prevSession ? prevSession._id : null
        })
    })
}

function getCurrentMembers(sessionId){
    return Session.findOne({_id: sessionId}, 'members')
    .lean()
    .then(session => session.members)
}

function getSprintFromId(sessionId){
    return Session.findOne({ _id: sessionId }, 'sprint')
    .lean()
    .then(project => (project ? project.sprint : null))
}

function disactiveSession(sessionId){
    return Session.update({ _id: sessionId }, { $set: { active: false } })
}

function closeSession(sessionId){
    return Promise.resolve(true);
    //write output
}

function changeState(toState, sessionId){
    return Promise.all([
        RetrospectiveType.findOne({ name: 'Check-in' }, '_id').lean(),
        RetrospectiveType.findOne({ name: 'Delta' }, '_id').lean(),
        Session.findOne({ _id: sessionId })
        ])
    .then(([checkin, delta, session]) => {
        if(toState == 0)
            session.currentState = checkin._id
        else if(toState == 2)
            session.currentState = delta._id
        else if(toState == 1)
            session.currentState = session.retrospectiveType

        return session.save()
        .then(() => {
            return getMetadata(sessionId)
            .then(metadata => metadata)
        })
    })
}


module.exports = {
    createSession: createSession,
    joinSession: joinSession,
    getMetadata: getMetadata,
    getCurrentMembers: getCurrentMembers,
    getSprintSessionsFromId: getSprintSessionsFromId,
    getSprintFromId: getSprintFromId,
    getPreviousSprintSession: getPreviousSprintSession,

    disactiveSession: disactiveSession,
    closeSession: closeSession,

    changeState: changeState,
    addMember: addMember,
    removeMember: removeMember,
    removeAllMembers: removeAllMembers
};