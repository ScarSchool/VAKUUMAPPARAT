const mongoose = require('mongoose');
const config = require('config');

async function initMongoose() {
	let dbContext = undefined;
	try {
		dbContext = await mongoose.connect(config.get('dbSettings.databaseURL') + '/' + config.get('dbSettings.databaseName'),
			{
				useNewUrlParser: true,
				useFindAndModify: false,
				useCreateIndex: true,
				useUnifiedTopology: true
			});
	} catch (err) {
		console.error(err);
	}
	return dbContext;
}

function isHealthy() {
	return mongoose.connection.readyState == 1;
}

module.exports.connect = initMongoose;
module.exports.isHealthy = isHealthy;