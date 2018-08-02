var socket = io()

const PORT = 52724

var sessionId = window.location.href.split('session/')[1].split('/')[0]
var sessionType = window.location.href.split('type/')[1].split('/')[0]
var username = localStorage.getItem('username')
var members = []
var allMembers = []
var allCheckin_data = []
var sprintCheckin_data = []
var sprint = -1
var cardsByUser = {}
var actionCards = []
var cardsById = {}
var currentlySelectedCard = null
var endCardsForPlusDelta = { plus: [], delta: [] }

var userToColor = {}
var currentlySelectedTimeline = { person: 'None', color: '#FFF' }

var colorScale = d3.scale.linear()
.domain([1, 5, 10])
.range(['#fb590e', '#ffff73', '#6aae35']);

function sendBaseMessage() {
    socket.emit('moderatorConnection', { name: username, sessionId: sessionId })
}

socket.on('mod_instructions', function (data) {
    drawInstruction(data)
})

let init = false
socket.on('members_mod', function (data) {
    !init ? updateData(true) : updateData()
    init = true
    members = data.members
    if (parseInt(data.sprint) != -1) {
        if (data.sprint)
            sprint = data.sprint
        redrawVotingScreen()
    }
})

socket.on('member_join', function (data){
    if(allMembers.indexOf(data) == -1)
        allMembers.push(data)
})

socket.on('update_header', function (data) {
    updateData()
})


socket.on('checkin_data', function (data) {
    sprintCheckin_data = data.sprintData || []
    allCheckin_data = data.allData || []
    redrawVotingScreen()
    redrawGraphScreen()
})

socket.on('3w_card', function (data) {
    if (!Array.isArray(data))
        data = [data]

    data.forEach(function (card) {
        let user = card.data.name

        //cards is a map
        if (!cardsByUser[user])
            cardsByUser[user] = []

        let obj = { _id: card._id, user: user, data: card.data.data }

        cardsByUser[user].push(obj)
        cardsById[card._id] = obj
    })
    redrawCardSystem()
})

socket.on('action_card', function (data) {
    if (!Array.isArray(data))
        data = [data]

    data.forEach(function (card) {
        let obj = { _id: card._id, user: card.data.name, carryOver: card.carryOver, data: card.data.data }

        let index = actionCards.map(function (c) { return c._id }).indexOf(obj._id)
        if (index == -1)
            actionCards.push(obj)
        cardsById[card._id] = obj
    })

    redrawActionCards()
})

socket.on('end_card', function (data) {
    let card = data.data
    if (card.data.type == 'plus') {
        if (!endCardsForPlusDelta.plus)
            endCardsForPlusDelta.plus = []
        endCardsForPlusDelta.plus.push({ name: card.name, message: card.data.message, generated: card.data.generated, id: data._id })
    } else {
        if (!endCardsForPlusDelta.delta)
            endCardsForPlusDelta.delta = []
        endCardsForPlusDelta.delta.push({ name: card.name, message: card.data.message, generated: card.data.generated, id: data._id })
    }
    drawDelta()
})

function drawDelta() {
    let tableHTML = null
    endCardsForPlusDelta.plus.forEach(function (data) {
        tableHTML += '<tr style="margin-left:3px;">' +
        '<td style="padding:0 10px 0 10px;"><div style="font-size:120%;margin-left:100px;">' + data.name + ':' + data.message + '</div>' +
        '</td></tr>'
    })
    tableHTML ? $('#endPlus').html(tableHTML) : $('#endPlus').html('')
    tableHTML = null
    endCardsForPlusDelta.delta.forEach(function (data) {
        tableHTML += '<tr style="margin-left:3px;">' +
        '<td style="padding:0 10px 0 10px;"><div>' + data.name + ':' + data.message + '</div>' +
        '</td></tr>'
    })
    tableHTML ? $('#endDelta').html(tableHTML) : $('#endDelta').html('')
}

function redrawCardSystem() {
    let tableHTML = null

    Object.keys(cardsByUser).forEach(function (member) {
        tableHTML += '<tr style="margin-left:3px;">' +
        '<td style="padding:0 10px 0 10px;"><img src="/assets/pictures/noavatar.png" alt="" height="50" width="auto"><div><span>' + member + '</span></div>' +
        '</td>'
        cardsByUser[member].forEach(function (card, index) {
            let message = card.data.message, type = card.data.type
            let imageString = "/assets/pictures/" + (type == 'good' ? 'goodCard.png' : 'badCard.png')
            tableHTML += '<td style="vertical-align:top;padding-right:10px;"><img src="' + imageString + '" alt="" height="50" width="auto" onclick="openCard(' + "'" + card._id + "', " + (index + 1) + ')"></td>'
        })
        tableHTML += '</tr>'
    })
    if (tableHTML)
        $('#cardTable').html(tableHTML)
    else
        $('#cardTable').html('')
}

function redrawActionCards() {
    let tableHTML = null

    actionCards.forEach(function (card) {
        let cardType = card.data.type
        tableHTML += '<tr style="margin-left:20px;">' +
        '<td style="vertical-align:top;float:right;"><img src="/assets/pictures/actionPointCard.png" alt="" height="50" width="auto" onclick="openCard(' + "'" + card._id + "'" + ')"></td></tr>'
    })
    if (tableHTML)
        $('#actionCards').html(tableHTML)
    else
        $('#actionCards').html('')
}

function carryoverCard() {
    if (currentlySelectedCard) {
        socket.emit('carryon_card', { cardId: currentlySelectedCard._id, sessionId: sessionId })
    }
}

function inactiveCard() {
    if (currentlySelectedCard) {
        if (currentlySelectedCard.data.type != 'action') {
            let index = cardsByUser[currentlySelectedCard.user].map(function (c) { return c._id }).indexOf(currentlySelectedCard._id)
            cardsByUser[currentlySelectedCard.user].splice(index, 1)
            if (cardsByUser[currentlySelectedCard.user].length == 0)
                delete cardsByUser[currentlySelectedCard.user]
        } else {
            let index = actionCards.map(function (c) { return c._id }).indexOf(currentlySelectedCard._id)
            actionCards.splice(index, 1)
        }
        delete cardsById[currentlySelectedCard._id]

        socket.emit('inactive_card', { cardId: currentlySelectedCard._id })
        currentlySelectedCard = null

        $('#cardPopup').modal('hide');
    }
    redrawCardSystem()
    redrawActionCards()
}


function openCard(cardId, index) {
    $('#cardPopup').modal('show');

    currentlySelectedCard = cardsById[cardId]

    $('#modalTitle').html('<i class="fas fa-check-square"></i>   ' + (index ? (currentlySelectedCard.user + "- Card: " + index) : 'Action' + (currentlySelectedCard.carryOver ? ' (Carried from last sprint)' : '')))
    currentlySelectedCard.data.type == 'action' ? $('#carryOverCard').css('display', 'initial') : null
    $('#completeCard').html(currentlySelectedCard.completed ? '<i class="fas fa-check fa-lg"></i> Completed' : '<i class="fas fa-check fa-lg"></i> Complete')
    $('#cardName').html('NAME: ' + currentlySelectedCard.user)
    $('#cardMessage').html('MESSAGE: ' + currentlySelectedCard.data.message)
    $('#cardGenerated').html('GENERATED: ' + currentlySelectedCard.data.generated)

}

function completeCard() {
    if (currentlySelectedCard) {
        currentlySelectedCard.completed = !currentlySelectedCard.completed
        socket.emit('complete_card', { cardId: currentlySelectedCard._id })
        $('#cardPopup').modal('hide');
    }
}


function redrawVotingScreen() {
    let allMembers = []
    members.forEach(function (mem) { if (mem && allMembers.indexOf(mem) == -1) allMembers.push(mem) })
    sprintCheckin_data.forEach(function (mem) { if (mem.data.name && allMembers.indexOf(mem.data.name) == -1) allMembers.push(mem.data.name) })
    let tableRowOne = '<tr style="margin-left:3px;max-width:70px;">', tableRowTwo = '<tr style="margin-left:3px;max-width:70px;">', tableRowThree = '<tr style="margin-left:3px;max-width:70px;">'
    tableRowFour = '<tr style="margin-left:3px;min-height:500px;height:500px;width:70px; padding-left:5px; padding-right:5px;max-width:70px;">'
    allMembers.forEach(function (member) {
        member = member.length > 8 ? member.substring(0, 7) + '...' : member
        tableRowOne += '<td style="padding:0 3px 0 3px;"><img src="/assets/pictures/noavatar.png" alt="" height="60" width="60"></td>'
        tableRowTwo += '<td style="text-align:center;padding:0 3px 0 3px;">' + member + '</td>'
    })
    var average = { total: 0, amount: 0 }
    if (!sprintCheckin_data.length) {
        allMembers.forEach(function (member) { tableRowThree += '<td style="padding:0 3x 0 3px;"><i class="fas fa-exclamation fa-lg"></i></td>' })
    } else {
        allMembers.forEach(function (member) {
            let found = false
            sprintCheckin_data.forEach(function (row) {
                if (row.data.name == member && !found) {
                    average.total += row.data.data
                    average.amount = row.data.data == 0 ? average.amount : average.amount + 1
                    let coloredLength = row.data.data != 0 ? (row.data.data / 10 * 500) : 0
                    let pad = 500 - coloredLength

                    tableRowThree += '<td style="padding:0 3x 0 3px;"><i class="fas fa-check fa-lg"></i></td>'
                    tableRowFour += ('<td style="padding:0 3x 0 3px;">' +
                        '<div style="min-height: ' + pad + 'px; height:' + pad + 'px"> </div>' +
                        '<div style="background-color:' + colorScale(row.data.data - 1) + ';min-height: ' + coloredLength + 'px; height:' + coloredLength + 'px"> </div>' +
                        '<p>' + row.data.data + '</p>' +
                        '</td>')
                    found = true
                }

            })
            if (!found) {
                tableRowThree += '<td style="padding:0 3x 0 3px;"><i class="fas fa-exclamation fa-lg"></i></td>'
                tableRowFour += ('<td style="padding:0 3x 0 3px;">' + '<div style="min-height: 500px; height: 500px"> </div>')
            }
        })
    }
    $('#memberGraphic').html((tableRowOne + '</td>') + (tableRowTwo + '</td>') + (tableRowThree + '</td>') + (tableRowFour + '</td>'));
    $('#averageThisSprint').html('This Sprint Average: <b>' + (average.amount == 0 ? 0 : (average.total / average.amount)).toFixed(2) + '</b>')
}

function redrawGraphScreen() {
    let chartPoints = [], maxSprint = 0, minSprint = 100
    if (allCheckin_data.length) {
        allCheckin_data.forEach(d => {
            let x = parseInt(d.session.sprint), y = 0;
            d.data.forEach(node => {
                y += node.data.data
            })
            if (d.data.length) y = y / d.data.length
                chartPoints.push({ x: x, y: y })
            maxSprint = Math.max(maxSprint, x)
            minSprint = Math.min(minSprint, x)
        })

        chartPoints.sort(function (a, b) { return a.x - b.x })

        if (chartPoints.length >= 2) {
            var ctx = document.getElementById('myChart').getContext('2d');
            if (!ctx)
                return;
            var myLineChart = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: [{
                        data: chartPoints,
                        backgroundColor: 'rgb(0, 0, 0)',
                        borderColor: 'rgb(0, 0, 0)',
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

function nextSection() {
    if (started) {
        if (currentState != 2) {
            prevTime = currentDate
            currentDate = new Date()
            prevState = currentState
        }
        if (currentState == 0) {
            $('#main').css('display', 'block')
            $('#start').css('display', 'none')
            socket.emit('changeState', { sessionId: sessionId, currentState: currentState, dir: 'next' })
            cardsByUser = {}
            actionCards = []
            cardsById = {}
            currentState++;
            if (sessionType == 'Timeline')
                drawTimeline()
        } else if (currentState == 1) {
            $('#end').css('display', 'block')
            $('#main').css('display', 'none')
            socket.emit('changeState', { sessionId: sessionId, currentState: currentState, dir: 'next' })

            currentState++;
        }
    }
}

function prevSection() {
    if (started) {
        if (currentState != 0) {
            prevTime = currentDate
            currentDate = new Date()
            prevState = currentState
        }
        if (currentState == 1) {
            $('#start').css('display', 'block')
            $('#main').css('display', 'none')
            socket.emit('changeState', { sessionId: sessionId, currentState: currentState, dir: 'prev' })

            currentState--;
        } else if (currentState == 2) {
            $('#main').css('display', 'block')
            $('#end').css('display', 'none')
            socket.emit('changeState', { sessionId: sessionId, currentState: currentState, dir: 'prev' })
            cardsByUser = {}
            actionCards = []
            cardsById = {}
            currentState--;
            if (sessionType == 'Timeline')
                drawTimeline()
        }
    }
}

function closeRetrospective() {
    if (started) {
        //write out some form of report, probably json
        socket.emit('closeRetrospective', { sessionId: sessionId })
        window.location.href = window.location.href.split(PORT + '/')[0] + PORT;
    }
}

function terminateRetrospective() {
    if (started) {
        socket.emit('terminateRetrospective', { sessionId: sessionId })
        window.location.href = window.location.href.split(PORT + '/')[0] + PORT;
    }
}

function timelinePopupOpen() {
    $('#timelinePopup').modal('show');
    let tableHTML = ''
    allMembers.forEach(function(member){
        tableHTML += '<tr><td><div id="' + member + '" onclick="setCurrentPersonTimeline(' + "'" + member + "'" + ')">' + member + '</span></td></tr>'
    })
    $('#timelinePersonTable').html(tableHTML)
}

function closeTimelinePopup(){
    $('#timelinePopup').modal('hide');
    
    $('#timelineColor').css('background-color', currentlySelectedTimeline.color)
    $('#personName').html(currentlySelectedTimeline.person)
}

function setCurrentPersonTimeline(person){
    if(currentlySelectedTimeline.person)
        $('#'+currentlySelectedTimeline.person).html('')

    currentlySelectedTimeline.person = person

    $('#'+currentlySelectedTimeline.person).css('border', '1px solid black')
}

function setCurrentColorTimeline(color){
    if(currentlySelectedTimeline.color)
        $(currentlySelectedTimeline.color).html('')
    currentlySelectedTimeline.color = ('#' + color)

    $('#'+color).html('<i class="fas fa-check fa-lg" style="color:white;font-size:22px"/>')
}


function drawTimeline() {
    if (!$('#timeline').find('svg').length) {
        $.get('/api/session/' + sessionId + "/getTimelineDates", {},
            function (data) {
                console.log(data.startDate, data.endDate)

                let width = $('#timeline').width()
                $('#timeline').css('min-height', width * 0.4)

                height = $('#timeline').height()
                width = $('#timeline').width()

                var svg = d3.select("#timeline").append("svg")
                .attr("width", width)
                .attr("height", height)

                var draw = svg.append('svg')
                .attr('width', width - 40)
                .attr('height', height - 30)
                .attr('x', 70)

                draw.append('rect')
                .attr('width', width)
                .attr('height', height)
                .attr('fill', '#FFF')
                .style('pointer-events', 'all')

                var xScale = d3.time.scale()
                .domain([new Date(data.startDate), new Date(data.endDate)])
                .range([0, width])

                var values = [{ num: 1, label: 'Happy' }, { num: 2, label: '' }, { num: 3, label: 'Okay' }, { num: 4, label: '' }, { num: 5, label: 'Sad' }]

                var yScale = d3.scale.linear()
                .domain([1, 5])
                .range([0, height - 45])

                var yAxis = d3.svg.axis()
                .orient("left")
                .scale(yScale)
                .tickValues(values.map(d => d.num))
                .tickFormat((d, i) => values[i].label);

                var xAxis = d3.svg.axis()
                .orient("bottom")
                .scale(xScale)

                var y = svg.append('g')
                .call(yAxis)
                .attr("shape-rendering", "crispEdges")
                .attr("transform", "translate(" + 70 + "," + 15 + ")")

                var x = svg.append('g')
                .call(xAxis)
                .attr("shape-rendering", "crispEdges")
                .attr("transform", "translate(" + 70 + "," + (height - 30) + ")")

                y.selectAll('path')
                .attr("fill", "none")
                .attr("stroke", "#000")

                x.selectAll('path')
                .attr("fill", "none")
                .attr("stroke", "#000")


                var activeLine;

                var renderPath = d3.svg.line()
                .x(function (d) { return d[0]; })
                .y(function (d) { return d[1]; })
                .tension(0)
                .interpolate("cardinal");


                draw.call(d3.behavior.drag()
                    .on("dragstart", dragstarted)
                    .on("drag", dragged)
                    .on("dragend", dragended));

                function dragstarted() {
                    activeLine = draw.append("path")
                    .datum([])
                    .attr("fill", "none")
                    .attr("stroke", currentlySelectedTimeline.color)
                    .attr("stroke-width", "4px")
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-linecap", "round")

                    activeLine.datum().push(d3.mouse(this));
                }

                function dragged() {
                    activeLine.datum().push(d3.mouse(this));
                    activeLine.attr("d", renderPath);
                }

                function dragended() {
                    activeLine = null;
                }
            })
    }
}

redrawVotingScreen() 
