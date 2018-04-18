const Session = require('../models/session')

function createSession(projectName, sprintNumber, boardName, password) {
    return new Session({
        project: projectName,
        sprint: sprintNumber,
        name: boardName,
        password: password,
        active: true
    }).save();
}

function joinSession(projectName, sprintNumber, username, password) {
    return Session.findOne({ project: projectName, sprint: sprintNumber, password: password, active: true }, '_id')
        .then(session => {
            if (!session) return { err: 'Cannot find session with parameters' }
            else return session
        });
}

module.exports = {
    createSession: createSession,
    joinSession: joinSession
};