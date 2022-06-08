const dotenv = require('dotenv'),
	dotenvExpand = require('dotenv-expand'),
	fs = require('fs'),
	path = require('path'),
	io = require('socket.io'),
	uuidV4 = require('uuid/v4'),
	setUpWebsite = require('./website.js'),
	startHttpServer = require('./http-server.js'),
	startClientApi = require('./client-api.js'),
	startDeviceRelay = require('./device-relay.js'),
	startStreamRelay = require('./stream-relay.js'),
	startUtilitiesServer = require('./utilities-server.js'),
	AccountsManager = require('./accounts/accounts-manager.js'),
	DevicesManager = require('./devices/devices-manager.js'),
	ScenesManager = require('./scenes/scenes-manager.js'),
	Notifications = require('./notifications.js'),
	AutomationsManager = require('./automator/automations-manager.js'),
	Automator = require('./automator/automator.js');

let key,
	cert;

dotenvExpand(dotenv.config());

if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'development') {
	throw new Error('The NODE_ENV environment variable must be either "production" or "development".');
}

// TODO: Validate configuration.

if (process.env.OA_SSL) {
	const key_path = process.env.OA_SSL_KEY_PATH || 'key.pem',
		cert_path = process.env.OA_SSL_CERT_PATH || 'cert.pem';

	try {
		key = fs.readFileSync(__dirname + '/../' + key_path);
		cert = fs.readFileSync(__dirname + '/../' + cert_path);
	} catch (error) {
		throw new Error('The SSL key or certificate could not be loaded. Check the SSL configuration. (' + error + ')');
	}
}

AccountsManager.init()
	.then(DevicesManager.init)
	.then(ScenesManager.init)
	.then(Notifications.init)
	.then(() => Promise.resolve(new Automator()))
	.then(AutomationsManager.init)
	.then(() => {
		const jwt_secret = process.env.OA_JWT_SECRET || key || uuidV4(),
			website = setUpWebsite(jwt_secret),
			http_server = startHttpServer(website, key, cert),
			socket_io_server = io.listen(http_server, {
													  pingTimeout: 60000,
														pingInterval: 60000
													});

		startClientApi(socket_io_server, jwt_secret);
		startDeviceRelay(http_server, socket_io_server);
		startStreamRelay(http_server, key, cert);
		startUtilitiesServer(http_server);
	})
	.catch((error) => {
		console.error('An error was encountered while starting.', error);
		process.exit(1);
	});
