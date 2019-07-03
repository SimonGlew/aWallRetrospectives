var config = {
    port: 80,
    mongo: {
        hosts: 'cluster0-shard-00-00-fwvma.mongodb.net:27017,cluster0-shard-00-01-fwvma.mongodb.net:27017,cluster0-shard-00-02-fwvma.mongodb.net:27017',
        port: 27017,
        user: 'dbUser',
        password: '4LKSMGSfpEuQM4bq',
        db: 'test',
        ssl: true,
        retryWrites: true,
        replicaSet: 'Cluster0-shard-0',
        authSource: 'admin'
    }
}

module.exports = config;