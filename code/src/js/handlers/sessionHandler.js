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

function getMetadata(sessionId) {
    return Session.findOne({ _id: sessionId })
        .populate('retrospectiveType', 'name length')
        .populate('currentState', 'name')
        .lean();
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

function getSprintFromId(sessionId){
    return Session.findOne({ _id: sessionId }, 'sprint')
        .lean()
        .then(project => project.sprint)
}

module.exports = {
    createSession: createSession,
    joinSession: joinSession,
    getMetadata: getMetadata,
    addMember: addMember,
    removeMember: removeMember,
    getSprintSessionsFromId: getSprintSessionsFromId,
    getSprintFromId: getSprintFromId
};