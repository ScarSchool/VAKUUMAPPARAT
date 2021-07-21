const express = require('express');
const AppError = require('../errorhandling/error-model');

const router = express.Router();
const userController = require('../user/user-controller');
const config = require('config');
const User = require('../user/user-model');

const crypto = require('crypto');
const algorithm = 'aes-192-cbc';
const serverPK = require('../certs/serverSecret').PrivateKey;
const serverSalt = require('../certs/serverSecret').Salt;

const { Buffer } = require('buffer');
const key = crypto.scryptSync(serverPK, serverSalt, 24);
const iv = Buffer.alloc(16, 0);

router.post('/login', async (req, res, next) => {
	try {
		if (Object.keys(req.body).length == 2) {
			userController.hashPassword(req.body);
			let loggedInUser = await userController.findByCredentials(req.body, userController.deliveredProperties);
			if (loggedInUser) {
				// angelehnt an einen JWT 
				// aber noch mit einem Token, der nur vom Server gelesen werden kann 
				// der Rest wird "mitgesendet" damit der Client keinen zweiten Request 
				// machen muss - es dürfen in den Daten keine "Geheimnisse" enthalten sein
				let tokenResult = generateToken(loggedInUser);
				let authenticationInformation = {
					'token': tokenResult.token,
					'information': {
						'iss': 'APPSERVER',
						'sub': loggedInUser.id,
						'exp': tokenResult.exp,
						'user': {
							'_id' : loggedInUser._id,
							'username': loggedInUser.username,
							'firstname': loggedInUser.firstname,
							'lastname': loggedInUser.lastname,
						}
					}
				};
				res.send(authenticationInformation);
				return;
			}
		}

		next(new AppError(401, 'login failed'));
	} catch (e) {
		next(new AppError(401, e.message));
	}
});

router.post('/logout', authenticate, function (req, res) {
	res.status(200).send();
});

router.get('/secret', authenticate, function (req, res) {
	res.status(200).send('secret is here');
});

router.get('/whoIAm', authenticate, function (req, res) {
	res.status(200).send({ 'loggedInAs': req.user.username });
});

async function authenticate(req, res, next) {
	if (req.token) {
		try {
			let decryptedToken = decryptToken(req.token);
			// check if token is expired 
			if (Date.now() - decryptedToken.exp <= 10 * 1000) {
				let user = await User.findById(decryptedToken.userId);
				if (!user)
					throw new AppError(401, 'Token can\'t be resolved to a user.');
				req.user = {
					id: decryptedToken.userId,
					username: decryptedToken.username
				};
				next();
				return;
			}  
		} catch (err) {
			console.error('authentication failed - token parsing error ' + err);
		}
	}

	next(new AppError(401, 'authentication failed'));
}

function generateToken(loggedInUser) {
	let tokenExpTime = 30;
	let result = {};
	tokenExpTime = config.get('security.tokenExpirationTime');
	
	let expiresIn = Date.now() + tokenExpTime * 60000;
	let token = JSON.stringify({
		userId: loggedInUser.id,
		username: loggedInUser.username,
		exp: expiresIn
	});

	const cipher = crypto.createCipheriv(algorithm, key, iv);
	token = cipher.update(token, 'utf8', 'hex');
	token += cipher.final('hex');

	result = {
		'token': token,
		'exp': expiresIn
	};

	return result;
}

function decryptToken(encryptedToken) {
	const decipher = crypto.createDecipheriv(algorithm, key, iv);
	let decryptedToken = decipher.update(encryptedToken, 'hex', 'utf8');
	decryptedToken += decipher.final('utf8');
	decryptedToken = JSON.parse(decryptedToken);
	return decryptedToken;
}

module.exports.router = router;
module.exports.authenticate = authenticate;