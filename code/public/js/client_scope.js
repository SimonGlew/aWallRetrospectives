var socket = io()

var sessionId = window.location.href.split('52724/')[1].split('/')[0]
var username = localStorage.getItem('username')

var cardColor = null;

function sendBaseMessage() {
    socket.emit('clientConnection', { name: username, sessionId: sessionId })
}

function sendCheckinVote(d) {
    socket.emit('checkinVote', { data: d, name: username, sessionId: sessionId })
}

socket.on('startValue', function (data) {
    console.log(data)
})


function drawVoter(width, height) {
    var svg = d3.select("#d3voter").append("svg")
        .attr("width", width)
        .attr("height", height)

    var originX = width / 2;
    var originY = height / 2;
    var innerCircleRadius = 200;
    var outerCircleRadius = 320;
    var voteCircleRadius = 90;

    var g = svg.append("g");
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


    var circleG = svg.append("g");

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
                    .transition()
                    .duration(2000)
                    .ease('linear')
                    .text('Voted')

                $('#voteButton').fadeIn('slow')

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
    $('#title').html('<i class="fas fa-angle-double-right"></i>   Sprint <%=sessionData.sprint%>')
}

function changeCardColor(col) {
    if (col == 'good' || col == 'bad' || col == 'eh') {
        cardColor = col
    }

    if(col == 'good'){
        $('#good').css('border', '10px solid black')
        $('#bad').css('border', '0px solid black')
        $('#eh').css('border', '0px solid black')
    }
    else if(col == 'bad'){
        $('#bad').css('border', '10px solid black')
        $('#good').css('border', '0px solid black')
        $('#eh').css('border', '0px solid black')

    }
    else if(col == 'eh'){
        $('#eh').css('border', '10px solid black')
        $('#bad').css('border', '0px solid black')
        $('#good').css('border', '0px solid black')
    }
} 