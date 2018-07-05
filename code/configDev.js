var config = {
    port: 52724,
    mongo: {
        hosts: 'engr489awall-shard-00-00-ahazm.mongodb.net:27017,engr489awall-shard-00-01-ahazm.mongodb.net:27017,engr489awall-shard-00-02-ahazm.mongodb.net',
        port: 27017,
        user: 'dev',
        password: 'Hblvb7YxspI5DsEn',
        db: 'aWall',
        ssl: true,
        replicaSet: 'ENGR489aWall-shard-0',
        authSource: 'admin'
    }
}

module.exports = config;