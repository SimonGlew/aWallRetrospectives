global.isProduction = (process.env.NODE_ENV == 'prod')

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var socket = require('socket.io')(server)

require('./src/js/socketrouter')(socket)

var router = require('./src/js/router'),
config = isProduction ? require('./configProd') : require('./configDev');

var mongoSetup = require('./src/js/mongosetup')

global.Promise = require('bluebird')

global.outputToLog = function(str, mem){
	let date = new Date().toISOString()

	console.log("[",date,"] Member:", (mem ? mem : null), ": ", str)
}


mongoSetup.connect(config.mongo)
.then(res => {
	if (!res) throw "Mongo did not connect";
})

server.listen(process.env.PORT || config.port, function () {
	console.log('Listening on port ' + config.port);
});

app.set('view engine', 'ejs');
app.set('views', './src/views');
app.use(express.static('public'));
app.use('/', router);


