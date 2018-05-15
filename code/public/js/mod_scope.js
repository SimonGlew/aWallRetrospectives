var socket = io()

var sessionId = window.location.href.split('8081/')[1].split('/')[0]
var username = localStorage.getItem('username')

function sendBaseMessage(){
    socket.emit('moderatorConnection', { name: username, sessionId: sessionId })
}


socket.on('startValue', function(data) {
    console.log(data)
})