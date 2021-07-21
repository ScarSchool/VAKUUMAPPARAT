const https = require('https');
const fs = require('fs');

const express = require('express');
const bearerToken = require('express-bearer-token');
const config = require('config');
var runningMochaTests = false;

require('colors');

const dbConnector = require('./commons/dbConnector');
const initCronJobs = require('./commons/cronJobs');
const cors = require('./middleware/cors');
const { handleError, criticalErrorAnswer } = require('./errorhandling/error-handler');
const categoryCtrl = require('./category/category-controller');
const OfferCtrl = require('./offers/offer-controller');

const app = express();

// only in devevelopment environment and if mocha is running tests
if (config.get('devOptions') && process.argv.length >= 2 && process.argv[1].includes('mocha')) {
	module.exports = app;
	runningMochaTests = true;
}

// now do the async tasks 
(async function main() {
	let isHealthy = await connectDatabase();
	if (isHealthy)
		await configure();
	else
		configureInErrorMode();

	// turn web-server on 
	startWebServer();
})();

async function connectDatabase() {
	// connect to database	
	let dbConnectOK = false;
	try {
		let dbContext = await dbConnector.connect();
		if (!dbContext)
			throw new Error('dbContext is undefined.');

		console.log('SUCCESS: Database-Connection established.'.green);

		// drop database (be careful)
		if ((config.get('devOptions.recreateDatabase') && !config.get('devOptions.mockdata')) || runningMochaTests) {
			await dbContext.connection.dropDatabase();
			console.log('WARNING: Database recreated'.yellow);
		}
		dbConnectOK = true;
	} catch (err) {
		console.error(`ERROR: Could not connect to database: ${err}`.red);
	}

	return dbConnectOK;
}

async function configure() {
	try {
		app.use(express.json());
		app.use(bearerToken());
		app.use(cors.enable);

		console.log('\nLoading all routes ....'.green);
		loadAllRoutes();
		if (config.get('devOptions.createDefaultCategories') && !runningMochaTests) {
			console.log('\nCreate default categories....'.green);
			try {
				let categoriesData = fs.readFileSync('./mockData/defaultCategories.json');
				let categories = JSON.parse(categoriesData);
				await categoryCtrl.createDefaultCategories(categories);
				console.log('Default categories created.'.green);
			} catch (err) {
				console.error(`ERROR: Failed to create default categories: ${err}`);
			}
			
		}
		if (config.get('devOptions.createDefaultRequirements')) {
			console.log('\nCreate default requirement names....'.green);
			let requirementsData = fs.readFileSync('./mockData/defaultRequirementNames.json');
			let requirementNames = JSON.parse(requirementsData);
			await OfferCtrl.setDefaultRequirementNames(requirementNames);
			console.log('Default requirement names created.'.green);
		}
		await initCronJobs(config.get('cronJobs'));
		console.log('\nSUCCESS: Application configured.'.green);
	} catch (err) {
		console.error(`ERROR: Could not configure application: ${err.stack}`);
		process.exit(1);
	}
}

function configureInErrorMode() {
	app.get('/healthz', healthCheck);
	app.get('*', criticalErrorAnswer);
	console.log('WARNING: APP running in ERROR MODE'.yellow);
}

function loadAllRoutes() {
	const userRouter = require('./user/user-router');
	const authRouter = require('./authentication/auth-router').router;

	const { authenticate } = require('./authentication/auth-router');

	app.use(`${config.get('backend.apiPrefix')}/users`, userRouter);
	console.log(`${ config.get('backend.apiPrefix') }/users`.green);

	app.use(`${config.get('backend.apiPrefix')}`, authRouter);
	console.log(`${ config.get('backend.apiPrefix')}/login /logout /whoIAm`.green);

	// Healthcheck
	app.get('/healthz', healthCheck);

	app.use(authenticate);
	// Restricted Area	
	const categoryRouter = require('./category/category-router');
	const tagRouter = require('./tags/tag-router');

	app.use(`${ config.get('backend.apiPrefix')}/categories`, categoryRouter);
	console.log(`${ config.get('backend.apiPrefix')}/categories`.green);

	app.use(`${ config.get('backend.apiPrefix')}/tags`, tagRouter);
	console.log(`${ config.get('backend.apiPrefix')}/tags`.green);

	app.use(handleError);
}

function startWebServer() {
	// turn web-server on 
	try {
		https
			.createServer(
				{
					key: fs.readFileSync(config.get('security.certKeyFilePath')),
					cert: fs.readFileSync(config.get('security.certFilePath')),
				},
				app,
			)
			.listen(
				config.get('backend.port'),
				config.get('backend.hostname'),
				() => {
					console.log(
						`SUCCESS: Template Backend is up and running on ${config.get('backend.hostname')}:${config.get('backend.port')}`.green,
					);
					// for mocka
					if (typeof app.onListenComplete == 'function')
						app.onListenComplete();
				});
	} catch (err) {
		console.error(`ERROR: Backend fatal error: ${err}`.red);
	}
}

function healthCheck(req, res) {
	if (dbConnector.isHealthy()) {
		res.status(200).send('system currently available');
	} else {
		res.status(500).send('system currently not available');
	}
}