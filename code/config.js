var config = {
    port: 52723,
    mongo: {
        hosts: 'awall-shard-00-00-ahazm.mongodb.net:27017,awall-shard-00-01-ahazm.mongodb.net:27017,awall-shard-00-02-ahazm.mongodb.net',
        port: 27017,
        user: 'dev',
        password: 'Hblvb7YxspI5DsEn',
        db: 'aWall',
        ssl: true,
        replicaSet: 'aWall-shard-0',
        authSource: 'admin'
    }
}

module.exports = config;