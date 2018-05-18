const sessionHandler = require('./handlers/sessionHandler'),
    boardDataHandler = require('./handlers/boardDataHandler')

function socketRouter(io) {
    let moderatorSocket = { _id: null, _socket: null, name: 'moderator' }
    let clientSockets = []

    io.on('connection', (socket) => {
        socket.on('disconnect', (data) => {
            let indexToRemove = -1
            clientSockets.forEach((sock, index) => {
                if (sock._id == socket.id) {
                    console.log('SOCKET_DISCONNECTION')
                    indexToRemove = index
                    sessionHandler.removeMember(sock.sessionId, sock.name)
                        .then(mem => {
                            moderatorSocket._socket ? moderatorSocket._socket.emit('members_mod', { members: mem, sprint: -1 }) : null
                        })
                }
            })
            if(indexToRemove != -1) clientSockets.splice(indexToRemove, 1)
        })

        socket.on('moderatorConnection', (data) => {
            console.log('MODERATOR_CONNECTION')
            moderatorSocket = ({ _id: socket.id, _socket: socket, name: "moderator" })
        })

        socket.on('clientConnection', (data) => {
            clientSockets.forEach(sock => {
                if (sock._id == socket.id) {
                    return
                }
            })
            console.log('CLIENT_CONNECTION WITH NAME:', data.name)
            clientSockets.push({ _id: socket.id, _socket: socket, name: data.name, sessionId: data.sessionId })
            sessionHandler.addMember(data.sessionId, data.name)
                .then(mem => {
                    sessionHandler.getSprintFromId(data.sessionId)
                        .then(sprint => {
                            moderatorSocket._socket ? moderatorSocket._socket.emit('members_mod', { members: mem, spr: sprint }) : null
                        })
                })
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
                                    console.log(data)
                                    moderatorSocket._socket ? moderatorSocket._socket.emit('checkin_data', data) : null
                                })
                        })
                })

        })
    });
}

module.exports = socketRouter;

