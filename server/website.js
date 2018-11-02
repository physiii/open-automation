// ------------------------------  OPEN-AUTOMATION ----------------------------------- //
// -----------------  https://github.com/physiii/open-automation  -------------------- //
// --------------------------------- website.js -------------------------------------- //

const AccountsManager = require('./accounts/accounts-manager.js'),
	express = require('express'),
	bodyParser = require('body-parser'),
	cookie = require('cookie'),
	path = require('path'),
	fs = require('fs'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	compression = require('compression'),
	helmet = require('helmet'),
	jwt = require('jsonwebtoken'),
	webpack = require('webpack'),
	WebpackDevMiddleware = require('webpack-dev-middleware'),
	WebpackHotMiddleware = require('webpack-hot-middleware'),
	getWebpackConfig = require('../webpack.config'),
	MILLISECONDS_PER_SECOND = 1000,
	TAG = '[website.js]';

module.exports = function (jwt_secret) {
	const app = express(),
		do_hot_module_replacement = process.env.OA_HOT_MODULE_REPLACEMENT && process.env.NODE_ENV === 'development',
		helmet_options = {
			contentSecurityPolicy: {
				directives: {
					defaultSrc: ['\'self\''] // Only allow loading assets from same origin.
				}
			},
			crossdomain: {
				permittedPolicies: 'none' // Prevent clients like Flash and Acrobat from loading the site.
			},
			frameguard: {
				action: 'deny' // Prevent the site from being loaded in a frame.
			}
		};

	let logo_file_path = process.env.OA_LOGO_PATH || '/logo.png',
		webpack_compiler;

	try {
		fs.accessSync(__dirname + '/../public/' + logo_file_path);
	} catch (error) {
		logo_file_path = false;
	}

	// Set up webpack middleware (for automatic compiling/hot reloading).
	if (do_hot_module_replacement) {
		const webpack_config = getWebpackConfig({dev_middleware: true});

		webpack_compiler = webpack(webpack_config);

		app.use(WebpackDevMiddleware(webpack_compiler, {
			publicPath: webpack_config.output.publicPath,
			logLevel: 'warn'
		}));

		app.use(WebpackHotMiddleware(webpack_compiler));
	}

	// Loosen security policies in development to support webpack development mode and hot module reloading.
	if (process.env.NODE_ENV === 'development') {
		helmet_options.contentSecurityPolicy.directives.scriptSrc = ['\'self\'', '\'unsafe-eval\''];
		helmet_options.contentSecurityPolicy.directives.styleSrc = ['\'self\'', 'blob:'];
		helmet_options.hsts = false;
	}

	// Set security HTTP headers.
	app.use(helmet(helmet_options));

	// Support JSON encoded bodies.
	app.use(bodyParser.json());

	// Support encoded bodies.
	app.use(bodyParser.urlencoded({extended: true}));

	// Support gzip and deflate.
	app.use(compression());

	app.use(passport.initialize());
	app.use(passport.session());
	passport.serializeUser((user, done) => {
		done(null, user);
	});

	passport.use(new LocalStrategy((username, password, done) => {
		const account = AccountsManager.getAccountByUsername(username);

		if (!account) {
			console.log(TAG, 'Login ' + username + ': account not found.');
			return done(null, false);
		}

		account.isCorrectPassword(password).then((is_correct) => {
			if (!is_correct) {
				console.log(TAG, 'Login ' + username + ': incorrect password.');
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
		function verifyAccessToken (access_token, xsrf_token) {
			return new Promise((resolve, reject) => {
				if (!access_token) {
					reject('No access token');
					return;
				}

				jwt.verify(access_token, jwt_secret, {issuer: process.env.OA_API_TOKEN_ISSUER}, (error, claims) => {
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

		function respondWithAccessToken (account) {
			// Generate access token and CSRF token.
			account.generateAccessToken(process.env.OA_API_TOKEN_ISSUER, jwt_secret).then((tokens) => {
				// Store the access token in a cookie on client. This cookie
				// MUST be set to HttpOnly; and Secure; (if SSL is configured)
				// to protect against certain XSS and MITM attacks.
				response.setHeader('Set-Cookie', 'access_token=' + tokens.access_token + '; path=/; HttpOnly;' + (process.env.OA_SSL ? ' Secure;' : ''));

				response.json({
					account: account.clientSerialize(),
					xsrf_token: tokens.xsrf_token,
					access_token_expires: jwt.decode(tokens.access_token).exp * MILLISECONDS_PER_SECOND
				});
			}).catch((error) => {
				console.log(TAG, 'Token signing error.', error);
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
				console.log(TAG, 'Error validating access token (' + error + ').');
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

			console.log(TAG, 'Created account.', account_client_serialized);

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
		response.type('.js').send('window.OpenAutomation = {config: ' + JSON.stringify({
			app_name: process.env.OA_APP_NAME || 'Open Automation',
			logo_path: logo_file_path
		}) + '};');
	});

	app.get('*', (request, response) => {
		if (do_hot_module_replacement) {
			webpack_compiler.outputFileSystem.readFile(path.join(webpack_compiler.outputPath, 'index.html'), (error, result) => {
				if (error) {
					return next(error);
				}

				response.set('content-type', 'text/html');
				response.send(result);
				response.end();
			});
		} else {
			response.sendFile('/index.html', {root: __dirname + '/../public'});
		}
	});

	return app;
};
