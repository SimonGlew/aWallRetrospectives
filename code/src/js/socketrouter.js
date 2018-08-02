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
			if (indexToRemove != -1) clientSockets.splice(indexToRemove, 1)
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
					return boardDataHandler.getCheckinData(sessionIds, data.sessionId)
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
			return sessionHandler.addMember(data.sessionId, data.name)
				.then(mem => {
					return sessionHandler.getSprintFromId(data.sessionId)
						.then(sprint => {
							moderatorSocket._socket ? moderatorSocket._socket.emit('member_join', data.name) : null
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
							return boardDataHandler.getCheckinData(sessionIds, sessionId)
								.then(data => {
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
					moderatorSocket._socket ? moderatorSocket._socket.emit('3w_card', { name: socket.name, _id: card._id, data: card.data }) : null
				})
		})

		socket.on('ActionCard', (data) => {
			let sessionId = data.sessionId
			delete data.sessionId
			return boardDataHandler.saveCard(data, sessionId)
				.then(card => {
					moderatorSocket._socket ? moderatorSocket._socket.emit('action_card', { name: socket.name, _id: card._id, data: card.data }) : null
				})
		})

		socket.on('inactive_card', (data) => {
			return boardDataHandler.inactiveCard(data.cardId)
		})

		socket.on('carryon_card', (data) => {
			return boardDataHandler.carryonCard(data.cardId, data.sessionId)
		})

		socket.on('complete_card', (data) => {
			return boardDataHandler.completeCard(data.cardId)
		})

		socket.on('terminateRetrospective', (data) => {
			let sessionId = data.sessionId
			return sessionHandler.disactiveSession(sessionId)
				.then(() => {
					clientSockets.forEach(sock => {
						if (String(sock.sessionId) == String(sessionId))
							sock._socket.emit('terminateRetrospective', {})
					})
				})
		})

		socket.on('closeRetrospective', (data) => {
			let sessionId = data.sessionId
			return sessionHandler.closeSession(sessionId)
				.then(() => {
					clientSockets.forEach(sock => {
						if (String(sock.sessionId) == String(sessionId))
							sock._socket.emit('closeRetrospective', {})
					})
				})
		})

		socket.on('remove_members', (data) => {
			return sessionHandler.removeAllMembers(data.sessionId)
				.then(() => {
					return Promise.all([
						sessionHandler.getSprintFromId(data.sessionId),
						sessionHandler.getCurrentMembers(data.sessionId),
						sessionHandler.getSprintSessionsFromId(data.sessionId)
					])
						.then(([sprintInfo, members, sessionIds]) => {
							return boardDataHandler.getCheckinData(sessionIds, data.sessionId)
								.then(data => {
									socket.emit('members_mod', { members: members, sprint: sprintInfo })
								})
						})
				})
		})

		socket.on('endCard', (data) => {
			let sessionId = data.sessionId
			delete data.sessionId
			return boardDataHandler.saveEndCard(data, sessionId)
				.then(data => {
					moderatorSocket._socket ? moderatorSocket._socket.emit('end_card', data) : null
				})
		})

		socket.on('changeState', (data) => {
			//sessionId, currentState, dir (next, prev)
			if (data.currentState == 0) {
				//check-in
				if (data.dir == 'next') {
					return Promise.all([
						sessionHandler.changeState(1, data.sessionId),
						boardDataHandler.getAllCards(data.sessionId)
					])
						.then(([, cards]) => {
							socket.emit('update_header', null)
							socket.emit('3w_card', cards.nonA)
							socket.emit('action_card', cards.A)
						})
				}
			}
			else if (data.currentState == 1) {
				//main
				if (data.dir == 'next') {
					return sessionHandler.changeState(2, data.sessionId)
						.then(metadata => socket.emit('update_header', null))
				} else if (data.dir == 'prev') {
					return sessionHandler.changeState(0, data.sessionId)
						.then(metadata => socket.emit('update_header', null))
				}
			}
			else if (data.currentState == 2) {
				//delta
				if (data.dir == 'prev') {
					return Promise.all([
						sessionHandler.changeState(1, data.sessionId),
						boardDataHandler.getAllCards(data.sessionId)
					])
						.then(([, cards]) => {
							socket.emit('update_header', null)
							socket.emit('3w_card', cards.nonA)
							socket.emit('action_card', cards.A)
						})
				}
			}
		})
	});
}

module.exports = socketRouter;

