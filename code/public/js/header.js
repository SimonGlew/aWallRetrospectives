var width = $('#timerPlay').width() || $('#timer').width(),
height = $('#timerPlay').height() || $('#timer').height();

var radius = height / 0.7,
spacing = .09;

var startTime = new Date()
var currentDate = new Date();

var currentState = 0,
prevState = 0,
prevTime = new Date()
retrospectiveLength = 0,
started = false

var timers = []
for (let i = 0; i < 3; i++) {
    timers.push({ currentTime: 0 })
}

var color = d3.scale.linear()
.range(["hsl(-180,60%,50%)", "hsl(180,60%,50%)"])
.interpolate(function (a, b) { var i = d3.interpolateString(a, b); return function (t) { return d3.hsl(i(t)); }; });

var arcBody = d3.svg.arc()
.startAngle(0)
.endAngle(function (d) { return d.value * 2 * Math.PI; })
.innerRadius(function (d) { return d.index * radius; })
.outerRadius(function (d) { return (d.index + spacing) * radius; })
.cornerRadius(0);

var arcCenter = d3.svg.arc()
.startAngle(0)
.endAngle(function (d) { return d.value * 2 * Math.PI; })
.innerRadius(function (d) { return (d.index + spacing / 2) * radius; })
.outerRadius(function (d) { return (d.index + spacing / 2) * radius; });

var svg = d3.select("#timer").append("svg")
.attr("width", width)
.attr("height", height)
.append("g")
.attr("transform", "translate(" + ((width / 2) - 30) + "," + ((height / 2) + 5) + ")");

var field = svg.selectAll("g")
.data(fields(0,0))
.enter().append("g");

field.append("path")
.attr("class", "arc-body");

field.append("path")
.attr("id", function (d, i) { return "arc-center-" + i; })
.attr("class", "arc-center");


//d3.select(self.frameElement).style("height", height + "px");

function start(){
    $('#timerPlay').css('display', 'none')
    $('#timer').css('display', 'block')

    started = true

    startTime = new Date()
    currentDate = new Date()
    prevTime = new Date()
}

function tick() {
    if(started){
        //work out times for timers
        let added = timers[currentState].currentTime

        let nowTime = new Date().getTime()

        let currentTime = nowTime - currentDate.getTime() + added
        let overallTime = nowTime - startTime.getTime()

        $('#currentStateTime').html(msToHMS(currentTime));
        $('#overallTime').html(msToHMS(overallTime));

        let currentSeconds = msToSeconds(currentTime)
        let overallSeconds = msToSeconds(overallTime)

        if (!document.hidden) {
            field
            .each(function (d) { this._value = d.value; })
            .data(fields(currentSeconds, overallSeconds))
            .each(function (d) { d.previousValue = this._value; })
            .transition()
            .ease("elastic")
            .duration(500)
            .each(fieldTransition);
        }
    }
    setTimeout(tick, 1000);
}

function updateData(init) {
    var sessionId = window.location.href.split('session/')[1].split('/')[0]
    $.get('/api/' + sessionId + '/getMetadata', {})
    .then(data => {
        retrospectiveLength = data.currentState.length
        if(!init){
            timers[prevState].currentTime += (new Date().getTime() - prevTime.getTime()) 
        } 
        console.log('data', data)
        //sessionName: project: sprint
        $('#sessionName').html("<b>Project Details: </b> Sprint: " + data.sprint + ", for Project: " + data.project);
        //retrospectiveName name: retrospectiveType.name
        $('#retrospectiveName').html("<b>Retrospective:</b> " + data.name + ", Type: " + data.retrospectiveType.name);
        //members iterate through members
        let tableRowOne = '<tr>', tableRowTwo = '<tr>'
        data.members.forEach(function (member) {
            member = member.length > 6 ? member.substring(0, 5) + '...' : member
            tableRowOne += '<td><img src="/assets/pictures/noavatar.png" alt="" height="42" width="42"></td>'
            tableRowTwo += '<td style="text-align:center;">' + member + '</td>'
        })
        $('#members').html((tableRowOne + '</td>') + (tableRowTwo + '</td>'));
        //currentState = currentState.name
        $('#currentStateLabel').html("<b>Current State:</b> " + data.currentState.name);
    })
}
updateData(true)
tick();


function msToHMS(ms) {
    let dateString = ''

    var seconds = ms / 1000;
    var hours = parseInt(seconds / 3600);
    seconds = seconds % 3600;
    var minutes = parseInt(seconds / 60);
    seconds = seconds % 60;
    if (hours != 0)
        dateString = hours + ':'
    if (minutes >= 1) {
        if (minutes < 10)
            dateString += '0' + minutes + ':'
        else
            dateString += minutes + ':'
    }
    if (seconds >= 1) {
        if (seconds < 10)
            dateString += '0' + parseInt(seconds)
        else
            dateString += parseInt(seconds)
        if (hours == 0 && minutes == 0)
            dateString += ' seconds'
    } else {
        if(hours == 0 && minutes == 0)
            dateString += '00:00'
        else
            dateString += '00';
    }
    return dateString
}

function msToSeconds(ms){
    return ms / 1000
}

function fieldTransition() {
    var field = d3.select(this).transition();

    field.select(".arc-body")
    .attrTween("d", arcTween(arcBody))
    .style("fill", function (d) { return color(d.value); });

    field.select(".arc-center")
    .attrTween("d", arcTween(arcCenter));
}

function arcTween(arc) {
    return function (d) {
        var i = d3.interpolateNumber(d.previousValue, d.value);
        return function (t) {
            d.value = i(t);

            return arc(d);
        };
    };
}

function fields(stateTime, overallTime) {

    let stateTimer = retrospectiveLength ? (stateTime / retrospectiveLength) : 0

    if(stateTimer >= 1)
        stateTimer = 1
    let overallTimer = overallTime / (45 * 60)
    if(overallTimer >= 1)
        overallTimer = 1

    return [
    { index: .2, value: overallTimer },
    { index: .1, value: stateTimer }
    ];
}

function resetStateTime(){
    timers[currentState].currentTime = 0
    currentDate = new Date()
}

function resetOverallTime(){
    for(let i = 0; i < 3; i ++){
        timers[i].currentTime = 0
    }
    currentDate = new Date()
    startTime = new Date()
}

function removeAllMembers(){
    socket.emit('remove_members', { sessionId: sessionId })
}