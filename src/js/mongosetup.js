var mongoose = require('mongoose')

require('./includeModels')

function connect(config) {
    let uri = 'mongodb://' + config.user + ':' + config.password + "@" + config.hosts + ':' + config.port + '/' + config.db

    return mongoose.connect(uri, {
        ssl: config.ssl,
        replicaSet: config.replicaSet,
        authSource: config.authSource,
        useNewUrlParser: true
    })
        .then(() => {
            console.log('connection to mongo successful');
            return true
        },
        err => {
            return false
        })
}


module.exports = {
    connect: connect
};