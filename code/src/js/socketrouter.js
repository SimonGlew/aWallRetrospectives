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
					outputToLog('SOCKET_DISCONNECTION', sock.name)
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
			outputToLog('MODERATOR_CONNECTION', null)
			moderatorSocket = ({ _id: socket.id, _socket: socket, name: "moderator" })
			return Promise.all([
				sessionHandler.getMetadata(data.sessionId),
				sessionHandler.getSprintFromId(data.sessionId),
				sessionHandler.getCurrentMembers(data.sessionId),
				sessionHandler.getSprintSessionsFromId(data.sessionId)
				])
			.then(([metadata, sprintInfo, members, sessionIds]) => {
				return boardDataHandler.getCheckinData(sessionIds)
				.then(data => {
					socket.emit('mod_instructions', metadata);
					socket.emit('members_mod', { members: members, sprint: sprintInfo })
					socket.emit('checkin_data', data)
				})

			}) 
		})

		socket.on('clientConnection', (data) => {
			clientSockets.forEach(sock => {
				if (sock._id == socket.id) {
					return
				}
			})
			outputToLog('CLIENT_CONNECTION WITH NAME:' + data.name, data.name)
			clientSockets.push({ _id: socket.id, _socket: socket, name: data.name, sessionId: data.sessionId })
			sessionHandler.addMember(data.sessionId, data.name)
			.then(mem => {
				sessionHandler.getSprintFromId(data.sessionId)
				.then(sprint => {
					moderatorSocket._socket ? moderatorSocket._socket.emit('members_mod', { members: mem, sprint: sprint }) : null
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
						outputToLog(data, null)
						moderatorSocket._socket ? moderatorSocket._socket.emit('checkin_data', data) : null
					})
				})
			})

		})

		socket.on('ThreeWCard', (data) => {
			let sessionId = data.sessionId
			delete data.sessionId

			return boardDataHandler.saveCard(data, sessionId)
			.then(card => {
				moderatorSocket._socket ? moderatorSocket._socket.emit('3w_card', { name: socket.name, data: card }) : null
			})
		})

		socket.on('terminateRetrospective', (data) => {
			let sessionId = data.sessionId
			return sessionHandler.disactiveSession(sessionId)
			.then(() => {
				clientSockets.forEach(sock => {
					if(String(sock.sessionId) == String(sessionId)) 
						sock._socket.emit('terminateRetrospective', {})
				})
			})
		})

		socket.on('closeRetrospective', (data) => {
			let sessionId = data.sessionId
			return sessionHandler.closeSession(sessionId)
			.then(() => {
				clientSockets.forEach(sock => {
					if(String(sock.sessionId) == String(sessionId)) 
						sock._socket.emit('closeRetrospective', {})
				})
			})
		})

		socket.on('changeState', (data) => {
			//sessionId, currentState, dir (next, prev)
			if(data.currentState == 0){
				//check-in
				if(data.dir =='next'){
					return sessionHandler.changeState(1, data.sessionId)
						.then(metadata => socket.emit('update_header', null))
				}
			}
			else if(data.currentState == 1){
				//main
				if(data.dir == 'next'){
					return sessionHandler.changeState(2, data.sessionId)
						.then(metadata => socket.emit('update_header', null))
				}else if(data.dir == 'prev'){
					return sessionHandler.changeState(0, data.sessionId)
						.then(metadata => socket.emit('update_header', null))
				}
			}
			else if(data.currentState == 2){
				//delta
				if(data.dir =='prev'){
					return sessionHandler.changeState(1, data.sessionId)
						.then(metadata => socket.emit('update_header', null))
				}
			}
		})
	});
}

module.exports = socketRouter;

