// ------------------------------  OPEN-AUTOMATION ----------------------------------- //
// -----------------  https://github.com/physiii/open-automation  -------------------- //
// --------------------------------- website.js -------------------------------------- //

const config = require('../config.json'),
	AccountsManager = require('./accounts/accounts-manager.js'),
	uuid = require('uuid/v4'),
	express = require('express'),
	socket = require('./socket.js'),
	startGatewayServer = require('./gateway-server.js'),
	startClientApi = require('./client-api.js'),
	bodyParser = require('body-parser'),
	cookie = require('cookie'),
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
	website_port = config.website_port || 5000,
	website_secure_port = config.website_secure_port || 4443,
	is_ssl_enabled = config.use_ssl || false,
	is_dev_enabled = config.use_dev || false,
	MILLISECONDS_PER_SECOND = 1000;

let logo_file_path = config.logo_path || 'logo.png',
	ssl_key,
	ssl_cert;

module.exports = function (app) {
	var port,
		server,
		server_description;

	if (is_ssl_enabled) {
		try {
			ssl_key = fs.readFileSync(config.ssl_key_path || (__dirname + '/key.pem'));
			ssl_cert = fs.readFileSync(config.ssl_cert_path || (__dirname + '/cert.pem'));
		} catch (error) {
			console.error('There was an error when trying to load SSL files.', error);

			return;
		}
	}

	try {
		fs.accessSync(__dirname + '/../public/' + logo_file_path);
	} catch (error) {
		logo_file_path = false;
	}

	// Set JSON Web Tokens secret.
	const JWT_SECRET = ssl_key || uuid();

	function verifyAccessToken (access_token, xsrf_token) {
		return new Promise((resolve, reject) => {
			if (!access_token) {
				reject('No access token');
				return;
			}

			jwt.verify(access_token, JWT_SECRET, {issuer: config.api_token_issuer}, (error, claims) => {
				// Access token is invalid.
				if (error) {
					reject('Invalid access token ' + error.name);
					return;
				}

				// Access token or CSRF token is invalid.
				if (xsrf_token !== claims.xsrf_token) {
					reject('Invalid XSRF token');
					return;
				}

				const account = AccountsManager.getAccountById(claims.sub);

				if (!account) {
					reject('Account not found');
					return;
				}

				// Get the account for the account ID provided by the access token.
				resolve({
					account,
					refresh_token: claims.refresh_token
				});
			});
		});
	}

	// Set up webpack middleware (for automatic compiling/hot reloading).
	if (is_dev_enabled) {
		var webpack_env = {
			hot: true, // Used so that in webpack config we know when webpack is running as middleware.
			development: is_dev_enabled,
			production: !is_dev_enabled
		};
		var webpack_config = webpack_config_file(webpack_env);
		var webpack_compiler = webpack(webpack_config);
		app.use(WebpackDevMiddleware(webpack_compiler, {
			publicPath: webpack_config.output.publicPath,
			logLevel: 'warn'
		}));
		app.use(WebpackHotMiddleware(webpack_compiler));
	}

	// Support json encoded bodies.
	app.use(bodyParser.json());

	// Support encoded bodies.
	app.use(bodyParser.urlencoded({extended: true}));

	app.use(passport.initialize());
	app.use(passport.session());
	passport.serializeUser((user, done) => {
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
			return done(null, account);
		}).catch(() => {
			return done(null, false);
		});
	}));

	app.use('/', express.static(__dirname + '/../public'));

	app.get('/get_ip', (request, response) => {
		let ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;

		ip = ip.split(':');
		ip = ip[ip.length - 1];

		response.send(ip);
	});

	app.post('/api/token', (request, response, next) => {
		function respondWithAccessToken (account) {
			// Generate access token and CSRF token.
			account.generateAccessToken(config.api_token_issuer, JWT_SECRET).then((tokens) => {
				// Store the access token in a cookie on client. This cookie
				// MUST be set to HttpOnly; and Secure; (if SSL is configured)
				// to protect against certain XSS and MITM attacks.
				response.setHeader('Set-Cookie', 'access_token=' + tokens.access_token + '; path=/; HttpOnly;' + (is_ssl_enabled ? ' Secure;' : ''));

				response.json({
					account: account.clientSerialize(),
					xsrf_token: tokens.xsrf_token,
					access_token_expires: jwt.decode(tokens.access_token).exp * MILLISECONDS_PER_SECOND
				});
			}).catch((error) => {
				console.log('Token signing error.', error);
				response.sendStatus(500);
			});
		}

		if (request.body.grant_type === 'password') {
			// Authenticate user credentials.
			passport.authenticate('local', (error, account) => {
				if (error) {
					return next(error);
				}

				if (!account) {
					return response.sendStatus(401);
				}

				// Login successful.
				request.logIn(account, (error) => {
					if (error) {
						return next(error);
					}

					respondWithAccessToken(account);
				});
			})(request, response, next);
		} else if (request.body.grant_type === 'refresh') {
			const cookies = request.headers.cookie ? cookie.parse(request.headers.cookie) : {};

			verifyAccessToken(cookies.access_token, request.headers['x-xsrf-token']).then(({account, refresh_token}) => {
				account.verifyRefreshToken(refresh_token).then((is_refresh_token_valid) => {
					if (is_refresh_token_valid) {
						respondWithAccessToken(account);
					} else {
						response.sendStatus(401);
					}
				}).catch(() => {
					response.sendStatus(500);
				});
			}).catch((error) => {
				console.log('Error validating access token (' + error + ').');
				response.sendStatus(401);
			});
		} else {
			response.sendStatus(400);
		}
	});

	app.post('/api/logout', (request, response) => {
		// Delete the token cookies from client.
		response.setHeader('Set-Cookie', 'access_token=null; path=/; HttpOnly; expires=Thu, 01 Jan 1970 00:00:00 GMT;');
		response.sendStatus(200);
	});

	app.post('/api/account', (request, response) => {
		const username = request.body.username,
			password = request.body.password;

		AccountsManager.createAccount({username, password}).then((account) => {
			const account_client_serialized = account.clientSerialize();

			console.log('Created account.', account_client_serialized);

			response.status(201).json({account: account_client_serialized});
		}).catch((error) => {
			if (error === 'username') {
				response.sendStatus(409);
				return;
			}

			if(error === 'password') {
				response.sendStatus(422);
				return;
			}

			console.error('Tried to create an account, but there was an error.', error);
			response.sendStatus(500);
		});
	});

	app.get('/js/config.js', (request, response) => {

		const client_config = {
			app_name: config.app_name || 'Open Automation',
			logo_path: logo_file_path,
			stream_port: config.video_websocket_port
		};

		response.send('window.OpenAutomation = {config: ' + JSON.stringify(client_config) + '};');
	});

	app.get('*', (request, response) => {
		response.sendFile('/index.html', {root: __dirname + '/../public'});
	});

	// Create server.
	if (is_ssl_enabled) {
		port = website_secure_port;
		server = https.createServer({
			key: ssl_key,
			cert: ssl_cert
		}, app);
		server_description = 'Secure';
	} else {
		port = website_port;
		server = http.createServer(app);
		server_description = 'Insecure';
	}

	// Start servers.
	server.listen(port, null, () => console.log(server_description + ' server listening on port ' + port));

	const socket_server = socket(server);

	startClientApi(socket_server.onClientConnection, JWT_SECRET);
	startGatewayServer(socket_server.onDeviceConnection);
};
