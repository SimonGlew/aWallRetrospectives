var socket = io()

const PORT = 52724

var sessionId = window.location.href.split('session/')[1].split('/')[0]
var retroType = window.location.href.split('type/')[1].split('/')[0]
var username = localStorage.getItem('username')
var sprint = localStorage.getItem('sprint')

var cardColor = null;

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

var g, circleG
function drawVoter(width, height) {
    if(g || circleG){
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

function voteFinish(){
    $('#start').css('display', 'none')
    $('#main').css('display', 'block')
}

function cancelVote(){
    $('#voteButton').fadeOut('slow')
    $('#cancelVote').fadeOut('slow')

    circleG.transition()
    .duration(2000)
    .ease('linear')
    .style("opacity", "1");

    g.select('text')
    .text('Please Vote')
}


function changeCardColor(col) {
    if (col == 'good' || col == 'bad' || col =='action') {
        cardColor = col
    }

    if(col == 'good'){
        $('#good').css('border', '10px solid black')
        $('#bad').css('border', '0px solid black')
        $('#action').css('border', '0px solid black')
        $('#actionPointId').css('display', 'none')
    }
    else if(col == 'bad'){
        $('#bad').css('border', '10px solid black')
        $('#good').css('border', '0px solid black')
        $('#action').css('border', '0px solid black')
        $('#actionPointId').css('display', 'none')
    }
    else if(col == 'action'){
        $('#bad').css('border', '0px solid black')
        $('#good').css('border', '0px solid black')
        $('#action').css('border', '10px solid black')
        $('#actionPointId').css('display', 'block')
    }
} 

function addCard(){
    if(!$('#cardTextArea').val()) $('#cardErrorMessage').text("Please enter a value in text area");
    else if(!cardColor) $('#cardErrorMessage').text("Please select a color for the card");
    else{
        $('#cardErrorMessage').text('')
        let cardTextArea = $('#cardTextArea').val()
        let cardId = $('#actionPointId').val()


        if(cardColor != 'action') 
            socket.emit('ThreeWCard', { data: { type: cardColor, message: cardTextArea, generated: new Date() }, sessionId: sessionId, name: username })
        else
            socket.emit('ActionCard', { data: { type: cardColor, message: cardTextArea, cardId: cardId, generated: new Date() }, sessionId: sessionId, name: username })

        $('#cardTextArea').val('')
        $('#bad').css('border', '0px solid black')  
        $('#good').css('border', '0px solid black')   
        $('#action').css('border', '0px solid black')   
        cardColor = null 

        $('#cardMessageSuccess').css('display', 'block')
        $('#cardMessageSuccess').fadeOut(2500)
    }
}