const Config = require('../models/config')

function getQualityCards(){
	return Config.findOne({ type: 'QualityCards' }, 'data')
		.lean()
		.then(r => r.data)
}


module.exports = {
	getQualityCards: getQualityCards	
}