const express = require('express'),
    router = express.Router();

//add Handlers
const sessionHandler = require('./handlers/sessionHandler'),
    retrospectiveTypesHandler = require('./handlers/retrospectiveTypesHandler')

router.get('/', function (req, res) {
    res.redirect('/app')
    //res.render('login');
});

router.get('/app', function (req, res) {
    res.render('landing');
})

router.get('/app/login', function (req, res) {
    res.render('login');
});

router.get('/app/session/:sessionId/type/:type/mod', function (req, res) {
    res.render('mod_scope', {
        sessionId: req.params.sessionId
    });
});

router.get('/app/session/:sessionId/type/:type/par', function (req, res) {
    sessionHandler.getMetadata(req.params.sessionId)
        .then(data => {
            res.render('client_scope', {
                sessionData: data
            });
        })
});


router.get('/api/session/create', function (req, res) {
    sessionHandler.createSession(req.query.projectName, req.query.sprintNumber, req.query.boardName, req.query.password, req.query.retrospectiveType, req.query.startDate, req.query.endDate)
        .then(result => {
            res.send(result)
        })
});

router.get('/api/session/join', function (req, res) {
    sessionHandler.joinSession(req.query.projectName, req.query.sprintNumber, req.query.username, req.query.password)
        .then(result => {
            res.send(result)
        })
});

router.get('/api/retrospectivetypes', function (req, res) {
    retrospectiveTypesHandler.getAllRetrospectiveTypes()
        .then(result => {
            res.send(result)
        })
})

router.get('/api/session/:sessionId/getMetadata', function (req, res) {
    sessionHandler.getMetadata(req.params.sessionId)
        .then(result => {
            res.send(result)
        })
})

router.get('/api/session/:sessionId/getTimelineDates', function (req, res) {
    sessionHandler.getTimelineDatesAndMap(req.params.sessionId)
        .then(result => {
            res.send(result)
        })
})

router.get('/api/session/:sessionId/downloadSession', function (req, res) {
    console.log('DOWNLOAD SESSION', req.params.sessionId)
    sessionHandler.downloadSession(req.params.sessionId)
        .then(result => {
            res.contentType("application/octet-stream")
            res.setHeader("Content-Disposition", "attachment;filename=" + result.name + "_Sprint" + result.sprintNumber + "_" + Date.now() + "_data.json");
            res.send(result)
        })
})

module.exports = router;