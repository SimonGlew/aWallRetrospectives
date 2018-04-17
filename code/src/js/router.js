const express = require('express'),
    router = express.Router();

router.get('/', function (req, res) {
    res.send('test');
});

module.exports = router;