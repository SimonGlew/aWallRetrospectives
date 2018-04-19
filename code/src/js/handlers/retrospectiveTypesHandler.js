var mongoose = require('mongoose')

var RetrospectiveType = require('../models/retrospectiveType')

function getAllRetrospectiveTypes(){
    return RetrospectiveType.find({}, '_id name').lean()
        .then(list => list)    
}

module.exports = {
    getAllRetrospectiveTypes: getAllRetrospectiveTypes
}