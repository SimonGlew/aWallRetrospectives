var config = {
    port: 80,
    mongo: {
        hosts: 'retrospectives-shard-00-00-i0v7x.mongodb.net:27017,retrospectives-shard-00-01-i0v7x.mongodb.net:27017,retrospectives-shard-00-02-i0v7x.mongodb.net',
        port: 27017,
        user: 'dev',
        password: 'Hblvb7YxspI5DsEn',
        db: 'aWall',
        ssl: true,
        retryWrites: true,
        replicaSet: 'Retrospectives-shard-0',
        authSource: 'admin'
    }
}

module.exports = config;
