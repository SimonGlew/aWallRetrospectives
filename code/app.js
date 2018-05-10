var express = require('express');
var app = express();
var server = require('http').createServer(app);
var socket = require('socket.io')(server)

var router = require('./src/js/router'),
    config = require('./config');

var mongoSetup = require('./src/js/mongosetup')

global.Promise = require('bluebird')

mongoSetup.connect()
    .then(res => {
        if (!res) throw "Mongo did not connect";
    })

server.listen(config.port, function () {
    console.log('Listening on port ' + config.port);
});

app.set('view engine', 'ejs');
app.set('views', './src/views');
app.use(express.static('public'));
app.use('/', router);


socket.on('connection')