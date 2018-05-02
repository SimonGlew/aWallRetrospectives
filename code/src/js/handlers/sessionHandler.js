const Session = require('../models/session'),
    RetrospectiveType = require('../models/retrospectiveType')

function createSession(projectName, sprintNumber, boardName, password, rType) {
    return RetrospectiveType.findOne({ name: 'checkin' }, '_id').lean()
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

}

function joinSession(projectName, sprintNumber, username, password) {
    return Session.findOne({ project: projectName, sprint: sprintNumber, password: password, active: true }, '_id retrospectiveType')
        .populate('retrospectiveType', 'name')
        .then(session => {
            if (!session) return { err: 'Cannot find session with parameters' };
            if (!session.members) session.members = [];

            session.members.push(username)

            return session.save();
            //return Session.join(session._id, username);
        });
}

function getMetadata(sessionId) {
    return Session.findOne({ _id: sessionId })
        .populate('retrospectiveType', 'name length')
        .populate('currentState', 'name')
        .lean();
}

module.exports = {
    createSession: createSession,
    joinSession: joinSession,
    getMetadata: getMetadata
};