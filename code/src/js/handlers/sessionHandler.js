const Session = require('../models/session')

function createSession(projectName, sprintNumber, boardName, password, rType) {
    return new Session({
        project: projectName,
        sprint: sprintNumber,
        name: boardName,
        password: password,
        retrospectiveType: rType,
        active: true
    }).save()
        .then(session => {
            return joinSession(projectName, sprintNumber, username, password)
        })
}

function joinSession(projectName, sprintNumber, username, password) {
    return Session.findOne({ project: projectName, sprint: sprintNumber, password: password, active: true }, '_id retrospectiveType')
        .populate('retrospectiveType', 'name')
        .then(session => {
            if (!session) return { err: 'Cannot find session with parameters' }
            else return session
        });
}

module.exports = {
    createSession: createSession,
    joinSession: joinSession
};