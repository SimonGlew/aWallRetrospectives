var width = $('#timer').width(),
    height = $('#timer').height();

var radius = height / 0.7,
    spacing = .09;

var startTime = new Date()
var currentDate = new Date();

var currentState = 0,
    prevState = 0,
    prevTime = new Date()

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
    .cornerRadius(6);

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
    .data(fields)
    .enter().append("g");

field.append("path")
    .attr("class", "arc-body");

field.append("path")
    .attr("id", function (d, i) { return "arc-center-" + i; })
    .attr("class", "arc-center");


//d3.select(self.frameElement).style("height", height + "px");

function tick() {
    //work out times for timers
    let added = timers[currentState].currentTime

    let nowTime = new Date().getTime()

    let currentTime = msToHMS(nowTime - currentDate.getTime() + added)
    let overallTime = msToHMS(nowTime - startTime.getTime())


    $('#currentStateTime').html(currentTime);
    $('#overallTime').html(overallTime);


    if (!document.hidden) {
        field
            .each(function (d) { this._value = d.value; })
            .data(fields)
            .each(function (d) { d.previousValue = this._value; })
            .transition()
            .ease("elastic")
            .duration(500)
            .each(fieldTransition);
    }

    setTimeout(tick, 1000);
}

function updateData(init) {
    var sessionId = window.location.href.split('session/')[1].split('/')[0]
    $.get('/api/' + sessionId + '/getMetadata', {})
        .then(data => {
            if(!init) 
                timers[prevState].currentTime += (new Date().getTime() - prevTime.getTime())
            //sessionName: project: sprint
            $('#sessionName').html("<b>Project Details: </b> Sprint: " + data.sprint + ", for Project: " + data.project);
            //retrospectiveName name: retrospectiveType.name
            $('#retrospectiveName').html("<b>Retrospective:</b> " + data.name + ", Type: " + data.retrospectiveType.name);
            //members iterate through members
            let tableRowOne = '<tr>', tableRowTwo = '<tr>'
            data.members.forEach(function (member) {
                member = member.length > 12 ? member.substring(0, 10) + '...' : member
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
        dateString += '00';
    }
    return dateString
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

function fields() {
    let now = new Date();
    return [
        { index: .2, value: 0.75 },
        { index: .1, value: 0.50 }
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