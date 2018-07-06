const express = require('express'),
    router = express.Router();

//add Handlers
const sessionHandler = require('./handlers/sessionHandler'),
    retrospectiveTypesHandler = require('./handlers/retrospectiveTypesHandler')

router.get('/', function (req, res) {
    res.render('login');
});

router.get('/login', function (req, res) {
    res.render('login');
});

router.get('/session/:sessionId/type/:type/mod', function (req, res) {
    res.render('mod_scope', {
        sessionId: req.params.sessionId
    });
});

router.get('/session/:sessionId/type/:type/par', function (req, res) {
    sessionHandler.getMetadata(req.params.sessionId)
        .then(data => {
            res.render('client_scope', {
                sessionData: data
            });
        })
});

router.get('/api/session/create', function(req, res){
    sessionHandler.createSession(req.query.projectName, req.query.sprintNumber, req.query.boardName, req.query.password, req.query.retrospectiveType)
        .then(result => {
            res.send(result)
        })
});
   
router.get('/api/session/join', function(req, res){
    sessionHandler.joinSession(req.query.projectName, req.query.sprintNumber, req.query.username, req.query.password)
        .then(result => {
            res.send(result)
        })
});

router.get('/api/retrospectivetypes', function(req, res){
    retrospectiveTypesHandler.getAllRetrospectiveTypes()
        .then(result => {
            res.send(result)
        })
})

router.get('/api/:sessionId/getMetadata', function(req, res){
    sessionHandler.getMetadata(req.params.sessionId)
        .then(result => {
            res.send(result)
        })
})

module.exports = router;