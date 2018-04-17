var express = require('express');
var app = express();
var server = require('http').createServer(app);

var router = require('./src/js/router'),
    config = require('./config')

server.listen(config.port, function() {
	console.log('Listening on port ' + config.port);
});

app.set('views', './src/views');
app.use(express.static('public'));
app.use('/', router);
