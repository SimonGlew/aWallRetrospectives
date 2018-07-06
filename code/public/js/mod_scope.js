var socket = io()

const PORT = 52724

var sessionId = window.location.href.split('session/')[1].split('/')[0]
var username = localStorage.getItem('username')
var members = [],
checkin_data = [],
sprint = -1,
cards = {}

var currentState = 0


function sendBaseMessage() {
    socket.emit('moderatorConnection', { name: username, sessionId: sessionId })
}

socket.on('mod_instructions', function (data) {
    drawInstruction(data)
})

socket.on('members_mod', function (data) {
    updateData()
    members = data.members
    if(parseInt(data.sprint) != -1){
        if(data.sprint)
            sprint = data.sprint
        redrawVotingScreen()
    }
})

socket.on('update_header', function (data) {
    updateData()
})


socket.on('checkin_data', function (data) {
    checkin_data = data
    redrawVotingScreen()
    redrawGraphScreen()
})

socket.on('3w_card', function (data) {
    let user = data.name
    let data = data.data
    //cards is a map
    if(!cards[user])
        cards[user] = []

    cards[user].push(data)
})


function redrawVotingScreen() {
    let tableRowOne = '<tr style="margin-left:3px;">', tableRowTwo = '<tr style="margin-left:3px;">', tableRowThree = '<tr style="margin-left:3px;">'
    tableRowFour = '<tr style="margin-left:3px;min-height:500px;height:500px;width:70px; padding-left:5px; padding-right:5px;">'
    members.forEach(function (member) {
        tableRowOne += '<td style="padding:0 10px 0 10px;"><img src="/assets/pictures/noavatar.png" alt="" height="60" width="60"></td>'
        tableRowTwo += '<td style="text-align:center;padding:0 10px 0 10px;">' + member + '</td>'
    })
    var average = { total: 0, amount: 0 }
    if (!checkin_data.length) {
        members.forEach(function (member) { tableRowThree += '<td style="padding:0 10px 0 10px;"><i class="fas fa-exclamation fa-lg"></i></td>' })
    } else {
        console.log('data', checkin_data)
        console.log('sprint', sprint)
        checkin_data.forEach(function (dat) {
            if (dat.session.sprint == sprint) {
                members.forEach(function (member) {
                    let found = false
                    dat.data.forEach(function (row) {
                        if (row.data.name == member && !found) {
                            average.total += row.data.data
                            average.amount = row.data.data == 0 ? average.amount : average.amount + 1
                            let coloredLength = row.data.data != 0 ? (row.data.data / 10 * 500) : 0
                            let pad = 500 - coloredLength

                            console.log('a', row.data.data, 'b', coloredLength, 'c', pad)
                            tableRowThree += '<td style="padding:0 10px 0 10px;"><i class="fas fa-check fa-lg"></i></td>'
                            tableRowFour += ('<td style="padding:0 10px 0 10px;">' +
                                '<div style="min-height: ' + pad + 'px; height:' + pad + 'px"> </div>' +
                                '<div style="background-color:blue;min-height: ' + coloredLength + 'px; height:' + coloredLength + 'px"> </div>' +
                                '<p>' + row.data.data + '</p>' +
                                '</td>')
                            found = true
                        }
                    })
                    if (!found){
                        tableRowThree += '<td style="padding:0 10px 0 10px;"><i class="fas fa-exclamation fa-lg"></i></td>'
                        tableRowFour += ('<td style="padding:0 10px 0 10px;">' + '<div style="min-height: 500px; height: 500px"> </div>')
                    } 
                })
            }
        })
    }
    $('#memberGraphic').html((tableRowOne + '</td>') + (tableRowTwo + '</td>') + (tableRowThree + '</td>') + (tableRowFour + '</td>'));
    $('#averageThisSprint').html('This Sprint Average: <b>' + (average.amount == 0 ? 0 : (average.total / average.amount)).toFixed(2) + '</b>')
}

function redrawGraphScreen() {
    let chartPoints = [], maxSprint = 0, minSprint = 100
    if (checkin_data.length) {
        checkin_data.forEach(d => {
            let x = parseInt(d.session.sprint), y = 0;
            d.data.forEach(node => {
                y += node.data.data
            })
            if (d.data.length) y = y / d.data.length
                chartPoints.push({ x: x, y: y })
            maxSprint = Math.max(maxSprint, x)
            minSprint = Math.min(minSprint, x)
        })

        if(chartPoints.length >= 2){
            var ctx = document.getElementById('myChart').getContext('2d');
            var myLineChart = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: [{
                        data: chartPoints,
                        backgroundColor: 'rgb(0, 0, 0)',
                        borderColor: '#66adff',
                        fill: false
                    }]
                },
                options: {
                    scales: {
                        xAxes: [{
                            type: 'linear',
                            position: 'bottom',
                            ticks: {
                                min: minSprint,
                                max: maxSprint,
                                stepSize: 1,
                                fontSize: 20
                            },
                            scaleLabel: {
                                display: true,
                                labelString: 'Sprints',
                                fontSize: 20
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                min: 1,
                                max: 10,
                                stepSize: 1,
                                fontSize: 20
                            }
                        }]
                    },
                    legend: {
                        display: false
                    }
                }
            });
        }
    }
}

function drawInstruction(data) {
    $('#instructionsProjectName').html('Project Name: <b>' + data.project + '</b>')
    $('#instructionsSprintNumber').html('Sprint Number: <b>' + data.sprint + '</b>')
    $('#instructionsPassword').html('Password: <b>' + data.password + '</b>')
}

function nextSection(){
    if(currentState == 0){
        $('#main').css('display', 'block')
        $('#start').css('display', 'none')
        socket.emit('changeState', { sessionId: sessionId, currentState: currentState, dir: 'next' })

        currentState ++;
    }else if(currentState == 1){
        $('#end').css('display', 'block')
        $('#main').css('display', 'none')  
        socket.emit('changeState', { sessionId: sessionId, currentState: currentState, dir: 'next' })

        currentState ++;
    }

}

function prevSection(){
    if(currentState == 1){
        $('#start').css('display', 'block')
        $('#main').css('display', 'none')
        socket.emit('changeState', { sessionId: sessionId, currentState: currentState, dir: 'prev' })

        currentState --;
    }else if(currentState == 2){
        $('#main').css('display', 'block')
        $('#end').css('display', 'none')
        socket.emit('changeState', { sessionId: sessionId, currentState: currentState, dir: 'prev' })

        currentState --;
    }
}

function closeRetrospective(){
    //write out some form of report, probably json
    socket.emit('closeRetrospective', { sessionId: sessionId })
    window.location.href = window.location.href.split(PORT + '/')[0] + PORT;
}

function terminateRetrospective(){
    socket.emit('terminateRetrospective', { sessionId: sessionId })
    window.location.href = window.location.href.split(PORT + '/')[0] + PORT;
}

redrawVotingScreen() 
