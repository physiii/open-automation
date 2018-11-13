// ------------------------------  OPEN-AUTOMATION ----------------------------------- //
// -----------------  https://github.com/physiii/open-automation  -------------------- //
// ----------------------------- physiphile@gmail.com -------------------------------- //

const fs = require('fs'),
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
	Notifications = require('./automator/notifications.js'),
	Automator = require('./automator/automator.js');

let config;

// Import config or create new config.json with defaults.
try {
	config = require('../config.json');
} catch (read_error) {
	config = {
		app_name: 'Open Automation',
		use_ssl: false,
		ssl_key_path: '',
		ssl_cert_path: '',
		api_token_issuer: null,
		domain_name: 'localhost',
		website_port: 5000,
		website_secure_port: 443,
		video_stream_port: 8082
	};

	fs.writeFileSync(path.join(__dirname, '../', '/config.json'), JSON.stringify(config, null, '  '));

	console.log('Created config.json with default configuration.');
}

let key,
	cert;

if (config.use_ssl) {
	key = fs.readFileSync(config.ssl_key_path || (__dirname + '/key.pem'));
	cert = fs.readFileSync(config.ssl_cert_path || (__dirname + '/cert.pem'));
}

AccountsManager.init()
	.then(DevicesManager.init)
	.then(ScenesManager.init)
	.then(Notifications.init)
	.then(Automator.init)
	.then(() => {
		const jwt_secret = key || uuidV4(),
			website = setUpWebsite(config.use_ssl, jwt_secret),
			http_server = startHttpServer(website, key, cert),
			socket_io_server = io.listen(http_server);

		startClientApi(socket_io_server, jwt_secret);
		startDeviceRelay(http_server, socket_io_server);
		startStreamRelay(http_server);
		startUtilitiesServer(http_server);
	})
	.catch((error) => console.error(error));
