var socket = io()

const PORT = 80

var sessionId = window.location.href.split('session/')[1].split('/')[0]
var retroType = window.location.href.split('type/')[1].split('/')[0]
var username = localStorage.getItem('username')
var sprint = localStorage.getItem('sprint')

var cardColor = null;
var endType = null;

var currentState = 0;

var LTLCards = { 'good': [], 'bad': [], 'action': [] }
var LTLIndex = 0
var LTIState = 0

function sendBaseMessage() {
    socket.emit('clientConnection', { name: username, sessionId: sessionId })
}

function sendCheckinVote(d) {
    socket.emit('checkinVote', { data: d, name: username, sessionId: sessionId })
}

socket.on('closeRetrospective', function (data) {
    window.location.href = window.location.href.split(PORT + '/')[0] + PORT;
})

socket.on('terminateRetrospective', function (data) {
    window.location.href = window.location.href.split(PORT + '/')[0] + PORT;
})

socket.on('showLTLCards', function (data) {
    console.log('TEST')
    $('#LikeToLikePicking').css('display', 'block')
    drawCardLTL()
})

socket.on('updateLTLState', function (data) {
    if (data.update || LTIState != data.state) {
        if (data.state == 0) {
            $('#LikeToLikeCards').css('display', 'block')
            $('#LikeToLikePicking').css('display', 'none')
            $('#LikeToLikeAction').css('display', 'none')
        }
        if (data.state == 1) {
            $('#LikeToLikeCards').css('display', 'none')
            $('#LikeToLikePicking').css('display', 'block')
            $('#LikeToLikeAction').css('display', 'none')

            drawCardLTL()
        }
        if (data.state == 2) {
            $('#LikeToLikeCards').css('display', 'none')
            $('#LikeToLikePicking').css('display', 'none')
            $('#LikeToLikeAction').css('display', 'block')
        }
        LTIState = data.state
    }
})

var g, circleG
function drawVoter(width, height) {
    if (g || circleG) {
        g = null
        circleG = null
    }
    var svg = d3.select("#d3voter").append("svg")
        .attr("width", width)
        .attr("height", height)

    var originX = width / 2;
    var originY = height / 2;
    var innerCircleRadius = 200;
    var outerCircleRadius = 320;
    var voteCircleRadius = 90;

    g = svg.append("g");
    g.append("circle").attr({
        id: 'mainCircle',
        cx: originX,
        cy: originY,
        r: innerCircleRadius,
        fill: "white",
        stroke: "black"
    });

    g.append("text")
        .text('Please Vote')
        .attr('x', originX)
        .attr('y', originY)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .style("font-size", "60px")


    circleG = svg.append("g");

    var circleOriginX = originX + ((outerCircleRadius) * Math.sin(0.2 * 2 * Math.PI));
    var circleOriginY = originY - ((outerCircleRadius) * Math.cos(0.2 * 2 * Math.PI));

    var colourScale = d3.scale.linear()
        .domain([1, 5, 10])
        .range(['#fc8d59', '#ffffbf', '#91cf60']);

    for (let i = 0; i <= 10; i++) {
        circleG.append('circle').attr({
            id: 'circle' + i,
            cx: circleOriginX,
            cy: circleOriginY,
            r: voteCircleRadius,
            fill: colourScale(i),
            stroke: "black"
        })
            .datum(i)
            .on("click", function (d) {
                sendCheckinVote(d);

                circleG.transition()
                    .duration(2000)
                    .ease('linear')
                    .style("opacity", "0");

                g.select('text')
                    .text('Voted')

                $('#voteButton').fadeIn('slow')
                $('#cancelVote').fadeIn('slow')

            })

        circleG.append('text')
            .text(i)
            .attr('x', circleOriginX)
            .attr('y', circleOriginY)
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .style("font-size", "60px")
            .style('pointer-events', 'none')

        circleOriginX = originX + ((outerCircleRadius) * Math.sin((i + 1) / 10 * 2 * Math.PI))
        circleOriginY = originY - ((outerCircleRadius) * Math.cos((i + 1) / 10 * 2 * Math.PI))
    }


}

function voteFinish() {
    currentState = 1;
    $('#start').css('display', 'none')
    $('#main').css('display', 'block')
}

function cancelVote() {
    $('#voteButton').fadeOut('slow')
    $('#cancelVote').fadeOut('slow')

    circleG.transition()
        .duration(2000)
        .ease('linear')
        .style("opacity", "1");

    g.select('text')
        .text('Please Vote')
}


function changeCardColor(col, timeline, ltl) {
    if (col == 'good' || col == 'bad' || col == 'action') {
        cardColor = col
    }

    if (col == 'good') {
        $('#good').css('border', '10px solid black')
        $('#bad').css('border', '0px solid black')
        $('#action').css('border', '0px solid black')
    }
    else if (col == 'bad') {
        $('#bad').css('border', '10px solid black')
        $('#good').css('border', '0px solid black')
        $('#action').css('border', '0px solid black')
    }
    else if (col == 'action') {
        $('#bad').css('border', '0px solid black')
        $('#good').css('border', '0px solid black')
        $('#action').css('border', '10px solid black')

        if (timeline) {
            $('#actionTimeline').css('border', '10px solid black')
        }
        if (ltl) {
            $('#actionLTL').css('border', '10px solid black')
        }
    }
}

function changeLTLColor(col) {
    if (col == 'good' || col == 'bad' || col == 'action') {
        cardColor = col
    }

    if (col == 'good') {
        $('#LTLGood').css('border', '10px solid black')
        $('#LTLBad').css('border', '0px solid black')
        $('#LTLAction').css('border', '0px solid black')
    }
    else if (col == 'bad') {
        $('#LTLBad').css('border', '10px solid black')
        $('#LTLGood').css('border', '0px solid black')
        $('#LTLAction').css('border', '0px solid black')
    }
    else if (col == 'action') {
        $('#LTLBad').css('border', '0px solid black')
        $('#LTLGood').css('border', '0px solid black')
        $('#LTLAction').css('border', '10px solid black')
    }
}

function changeEnd(col) {
    if (col == 'plus' || col == 'delta') {
        endType = col
    }
    if (col == 'plus') {
        $('#plus').css('background-color', '#99A3A4')
        $('#delta').css('background-color', '#FFFFFF')
    } else {
        $('#plus').css('background-color', '#FFFFFF')
        $('#delta').css('background-color', '#99A3A4')
    }
}

function addEndData() {
    if (!$('#endTextArea').val()) $('#endErrorMessage').text("Please enter a value in text area");
    else if (!endType) $('#endErrorMessage').text("Please select a type for the card");
    else {
        $('#endErrorMessage').text('')
        let endTextArea = $('#endTextArea').val()

        socket.emit('endCard', { data: { type: endType, message: endTextArea, generated: new Date() }, sessionId: sessionId, name: username })

        $('#endTextArea').val('')
        $('#plus').css('background-color', '#FFFFFF')
        $('#delta').css('background-color', '#FFFFFF')
        endType = null

        $('#endMessageSuccess').css('display', 'block')
        $('#endMessageSuccess').fadeOut(2500)
    }
}

function addCard() {
    if ($('#cardTextArea').val().trim() == '') $('#cardErrorMessage').text("Please enter a value in text area");
    else if (!cardColor) $('#cardErrorMessage').text("Please select a color for the card");
    else {
        $('#cardErrorMessage').text('')
        let cardTextArea = $('#cardTextArea').val().trim()


        if (cardColor != 'action')
            socket.emit('ThreeWCard', { data: { type: cardColor, message: cardTextArea, generated: new Date() }, sessionId: sessionId, name: username })
        else
            socket.emit('ActionCard', { data: { type: cardColor, message: cardTextArea, generated: new Date() }, sessionId: sessionId, name: username })

        $('#cardTextArea').val('')
        $('#bad').css('border', '0px solid black')
        $('#good').css('border', '0px solid black')
        $('#action').css('border', '0px solid black')
        cardColor = null

        $('#cardMessageSuccess').css('display', 'block')
        $('#cardMessageSuccess').fadeOut(2500)
    }
}

function addCardTimeline() {
    if (!$('#cardTextAreaTimeline').val().trim()) $('#cardErrorMessageTimeline').text("Please enter a value in text area");
    else if (!cardColor) $('#cardErrorMessageTimeline').text("Please select a color for the card");
    else {
        $('#cardErrorMessageTimeline').text('')
        let cardTextArea = $('#cardTextAreaTimeline').val().trim()

        socket.emit('ActionCard', { data: { type: cardColor, message: cardTextArea, generated: new Date() }, sessionId: sessionId, name: username })

        $('#cardTextAreaTimeline').val('')
        $('#actionTimeline').css('border', '0px solid black')
        cardColor = null

        $('#cardErrorMessageTimeline').css('display', 'block')
        $('#cardErrorMessageTimeline').fadeOut(2500)
    }
}

function addCardActionLTL() {
    if (!$('#cardTextAreaActionLTL').val().trim()) $('#cardErrorMessageActionLTL').text("Please enter a value in text area");
    else if (!cardColor) $('#cardErrorMessageActionLTL').text("Please select a color for the card");
    else {
        $('#cardErrorMessageActionLTL').text('')
        let cardTextArea = $('#cardTextAreaActionLTL').val().trim()

        socket.emit('ActionCard', { data: { type: cardColor, message: cardTextArea, generated: new Date() }, sessionId: sessionId, name: username })

        $('#cardTextAreaActionLTL').val('')
        $('#actionActionLTL').css('border', '0px solid black')
        cardColor = null

        $('#cardErrorMessageActionLTL').css('display', 'block')
        $('#cardErrorMessageActionLTL').fadeOut(2500)
    }
}


function addCardLTL() {
    if (!$('#cardTextAreaLTL').val().trim()) $('#cardErrorMessageLTL').text("Please enter a value in text area");
    else if (!cardColor) $('#cardErrorMessageLTL').text("Please select a color for the card");
    else {
        $('#cardErrorMessageLTL').text('')
        let cardTextArea = $('#cardTextAreaLTL').val().trim()
        let id = username + '$' + (LTLIndex++)
        LTLCards[cardColor].push({ id: id, message: cardTextArea, generated: new Date(), used: false })

        socket.emit('LTLCard', { generatedId: id, sessionId: sessionId, name: username, generated: new Date(), type: cardColor, message: cardTextArea })

        $('#cardTextAreaLTL').val('')
        $('#LTLBad').css('border', '0px solid black')
        $('#LTLGood').css('border', '0px solid black')
        $('#LTLAction').css('border', '0px solid black')
        cardColor = null

        $('#cardMessageSuccessLTL').css('display', 'block')
        $('#cardMessageSuccessLTL').fadeOut(2500)
    }
}

function drawCardLTL() {
    let tableHTML = ''

    function cardToTable(list, type, html) {
        let colorMap = { 'good': '#00A51D', 'bad': '#FF5656', 'action': '#0094FF' }
        list.forEach(r => {
            if (!r.used) {
                html += '<tr><td style="padding-bottom:5px;text-align:left;"><div style="font-size:320%;padding-left:10px;border-radius:10px;min-height:100px;border:5px solid ' + colorMap[type] + ';" onclick="selectLTLCard(' + "'" + r.id + "', " + "'" + type + "'" + ')">' + r.message + '</div></td></tr>'
            }
        })
        return html
    }

    if (LTLCards['good'].map(r => !r.used).length) {
        tableHTML += "<tr><td><div style='font-size:400%;text-align:center;'> Keep Doing </div></td></tr>"
        tableHTML = cardToTable(LTLCards['good'], 'good', tableHTML)
    }
    if (LTLCards['bad'].map(r => !r.used).length) {
        tableHTML += "<tr><td><div style='font-size:400%;text-align:center;'> Stop Doing </div></td></tr>"
        tableHTML = cardToTable(LTLCards['bad'], 'bad', tableHTML)

    }
    if (LTLCards['action'].map(r => !r.used).length) {
        tableHTML += "<tr><td><div style='font-size:400%;text-align:center;'> Start Doing </div></td></tr>"
        tableHTML = cardToTable(LTLCards['action'], 'action', tableHTML)
    }

    $('#LTLCards').html(tableHTML)
}

function selectLTLCard(id, type) {
    let arr = LTLCards[type]
    let index = arr.map(function (r) { return r.id }).indexOf(id)
    arr[index].used = true

    //send to screen
    socket.emit('Picked_LTLCard', { generatedId: arr[index].id, sessionId: sessionId })

    $('#LikeToLikePicking').css('display', 'none')
}


function back() {
    if (currentState != 0) {
        if (currentState == 1) {
            $('#start').css('display', 'block')
            cancelVote()
            $('#main').css('display', 'none')
            $('#end').css('display', 'none')
        } else if (currentState == 2) {
            $('#start').css('display', 'none')
            $('#main').css('display', 'block')
            $('#end').css('display', 'none')
        }
        currentState--;
    }
}

function next() {
    if (currentState != 2) {
        if (currentState == 0) {
            $('#start').css('display', 'none')
            $('#main').css('display', 'block')
            $('#end').css('display', 'none')
        } else if (currentState == 1) {
            $('#start').css('display', 'none')
            $('#main').css('display', 'none')
            $('#end').css('display', 'block')
        }
        currentState++;
    }
}