// ------------------------------  OPEN-AUTOMATION ----------------------------------- //
// -----------------  https://github.com/physiii/open-automation  -------------------- //
// --------------------------------- website.js -------------------------------------- //

const database = require('./database.js'),
	config = require('../config.json'),
	utils = require('./utils.js'),
	AccountsManager = require('./accounts/accounts-manager.js'),
	uuid = require('uuid/v4'),
	crypto = require('crypto'),
	express = require('express'),
	socket = require('./socket.js'),
	bodyParser = require('body-parser'),
	path = require('path'),
	url = require('url'),
	fs = require('fs'),
	https = require('https'),
	http = require('http'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	jwt = require('jsonwebtoken'),
	webpack = require('webpack'),
	WebpackDevMiddleware = require('webpack-dev-middleware'),
	WebpackHotMiddleware = require('webpack-hot-middleware'),
	webpack_config_file = require('../webpack.config'),
	WEBSITE_PORT = config.website_port || 5000,
	WEBSITE_SECURE_PORT = config.website_secure_port || 4443,
	IS_SSL_ENABLED = config.use_ssl || false,
	IS_DEV_ENABLED = config.use_dev || false,
	PASSWORD_HASH_ALGORITHM = 'sha512',
	XSRF_TOKEN_SIZE = 16;

let ssl_key, ssl_cert, jwt_secret;

module.exports = {
	start
};

function logAccountIn (account, response, callback) {
	const response_payload = {username: account.username};

	// Generate access token and CSRF token.
	Promise.all([
		account.generateAccessToken(config.api_token_issuer, jwt_secret),
		generateXsrfToken()
	]).then((values) => {
		// Store the tokens in cookies on client.
		response.setHeader('Set-Cookie', [
			'access_token=' + values[0] + '; path=/; HttpOnly;' + (IS_SSL_ENABLED ? ' Secure;' : ''),
			'xsrf_token=' + values[1] + '; path=/;'
		]);

		if (typeof callback === 'function') {
			callback(null, response_payload);
		}
	}).catch((error) => {
		console.log('Login ' + account.username + ': token signing error.', error);

		if (typeof callback === 'function') {
			callback(error, response_payload);
		}
	});
}

function generateXsrfToken () {
	return new Promise((resolve, reject) => {
		crypto.randomBytes(XSRF_TOKEN_SIZE, (error, token_buffer) => {
			if (error) {
				reject(error);
				return;
			}

			resolve(token_buffer.toString('hex'));
		});
	});
}

function start (app) {
	var port,
		server,
		server_description;

	if (IS_SSL_ENABLED) {
		try {
			ssl_key = fs.readFileSync(config.ssl_key_path || (__dirname + '/key.pem'));
			ssl_cert = fs.readFileSync(config.ssl_cert_path || (__dirname + '/cert.pem'));
		} catch (error) {
			console.error('There was an error when trying to load SSL files.', error);

			return;
		}
	}

	// Set JSON Web Tokens secret.
	jwt_secret = ssl_key || uuid();

	// Set up webpack middleware (for automatic compiling/hot reloading).
	if (IS_DEV_ENABLED) {
		var webpack_env = {
			hot: true, // Used so that in webpack config we know when webpack is running as middleware.
			development: IS_DEV_ENABLED,
			production: !IS_DEV_ENABLED
		};
		var webpack_config = webpack_config_file(webpack_env);
		var webpack_compiler = webpack(webpack_config);
		app.use(WebpackDevMiddleware(webpack_compiler, {
			publicPath: webpack_config.output.publicPath,
			logLevel: 'warn'
		}));
		app.use(WebpackHotMiddleware(webpack_compiler));
	}

	app.use(bodyParser.json()); // support json encoded bodies
	app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies
	var allowCrossDomain = function (req, res, next) {
		// TODO: Investigate removing these headers.
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
		if ('OPTIONS' == req.method) {
			res.send(200);
		} else {
			next();
		}
	};
	app.use(allowCrossDomain);

	app.use(passport.initialize());
	app.use(passport.session());
	passport.serializeUser(function (user, done) {
		done(null, user);
	});

	passport.use(new LocalStrategy((username, password, done) => {
		const account = AccountsManager.getAccountByUsername(username);

		if (!account) {
			console.log('Login ' + username + ': account not found.');
			return done(null, false);
		}

		account.isCorrectPassword(password).then((is_correct) => {
			if (!is_correct) {
				console.log('Login ' + username + ': incorrect password.');
				return done(null, false);
			}

			// Password is correct.
			return done(null, {account});
		}).catch(() => {
			return done(null, false);
		});
	}));

	app.use('/', express.static(__dirname + '/../public'));

	app.get('/get_ip', function(req, res) {
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		ip = ip.split(':');
		ip = ip[ip.length - 1];
		res.send(ip);
	});

	app.post(
		'/api/login',
		passport.authenticate('local'),
		(request, response) => {
			const account = request.user.account;

			logAccountIn(account, response, (error, payload) => {
				if (error) {
					response.sendStatus(500);
					return;
				}

				response.json(payload);
			});
		}
	);

	app.post('/api/register', function(request, response) {
		const existing_account = AccountsManager.getAccountByUsername(request.body.username);

		// Username is already in use.
		if (existing_account) {
			response.sendStatus(409);
			return;
		}

		AccountsManager.createAccount({
			username: request.body.username,
			password: request.body.password
		}).then((account) => {
			console.log('Created account.', account);

			logAccountIn(account, response, (error, payload) => {
				// Always respond that the account was created successfully,
				// even if there's a login error. The user just won't be
				// automatically logged in.
				response.status(201).json(payload);
			});
		}).catch((error) => {
			console.error('Tried to create an account, but there was an error.', error);
			response.sendStatus(500);
		});
	});

	app.get('*', function (request, response) {
		response.sendFile('/index.html', {root: __dirname + '/../public'});
	});

	// Create server.
	if (IS_SSL_ENABLED) {
		port = WEBSITE_SECURE_PORT;
		server = https.createServer({
			key: ssl_key,
			cert: ssl_cert
		}, app);
		server_description = 'Secure';
	} else {
		port = WEBSITE_PORT;
		server = http.createServer(app);
		server_description = 'Insecure';
	}

	// Start servers.
	server.listen(port, null, () => console.log(server_description + ' server listening on port ' + port));
	socket.start(server, jwt_secret);
}
