const sessionHandler = require('./handlers/sessionHandler'),
    boardDataHandler = require('./handlers/boardDataHandler')

function socketRouter(io) {
    let moderatorSocket = { _id: null, _socket: null, name: 'moderator' }
    let clientSockets = []

    io.on('connection', (socket) => {
        socket.on('disconnect', (data) => {
            clientSockets.forEach(sock => {
                if (sock._id == socket.id) {
                    sessionHandler.removeMember(sock.sessionId, sock.name)
                }
            })
        })

        socket.on('moderatorConnection', (data) => {
            moderatorSocket = ({ _id: socket.id, _socket: socket, name: "moderator" })
        })

        socket.on('clientConnection', (data) => {
            clientSockets.forEach(sock => {
                if (sock._id == socket.id) {
                    return
                }
            })
            clientSockets.push({ _id: socket.id, _socket: socket, name: data.name, sessionId: data.sessionId })
            sessionHandler.addMember(data.sessionId, data.name)
        })


        socket.on('checkinVote', (data) => {
            let sessionId = data.sessionId
            delete data.sessionId

            return boardDataHandler.saveCheckin(data, sessionId)
                .then(() => {
                    return sessionHandler.getSprintSessionsFromId(sessionId)
                        .then(sessionIds => {
                            return boardDataHandler.getCheckinData(sessionIds)
                                .then(data => {
                                    moderatorSocket._socket ? moderatorSocket._socket.emit('checkin_data', data) : null
                                })
                        })
                })

        })
    });
}

module.exports = socketRouter;