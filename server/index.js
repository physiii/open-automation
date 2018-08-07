// ------------------------------  OPEN-AUTOMATION ----------------------------------- //
// -----------------  https://github.com/physiii/open-automation  -------------------- //
// ----------------------------- physiphile@gmail.com -------------------------------- //

const fs = require('fs'),
	path = require('path'),
	https = require('https'),
	http = require('http'),
	uuid = require('uuid/v4'),
	setUpWebsite = require('./website.js'),
	startSocketServer = require('./socket-server.js'),
	startDeviceServer = require('./device-server.js'),
	startStreamRelay = require('./stream-relay.js'),
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
		use_ssl: false,
		ssl_key_path: '',
		ssl_cert_path: '',
		api_token_issuer: null,
		website_port: 5000,
		website_secure_port: 443,
		video_websocket_port: 8084,
		video_stream_port: 8082
	};

	fs.writeFileSync(path.join(__dirname, '../', '/config.json'), JSON.stringify(config, null, '  '));

	console.log('Created config.json with default configuration.');
}

const website_port = config.website_port || 5000,
	website_secure_port = config.website_secure_port || 4443,
	is_ssl_enabled = config.use_ssl || false;

let key,
	cert;

if (is_ssl_enabled) {
	key = fs.readFileSync(config.ssl_key_path || (__dirname + '/key.pem'));
	cert = fs.readFileSync(config.ssl_cert_path || (__dirname + '/cert.pem'));
}

AccountsManager.init()
	.then(DevicesManager.init)
	.then(ScenesManager.init)
	.then(Notifications.init)
	.then(Automator.init)
	.then(() => {
		const jwt_secret = key || uuid(),
			website = setUpWebsite(is_ssl_enabled, jwt_secret),
			server = is_ssl_enabled
				? https.createServer({key, cert}, website)
				: http.createServer(website),
			port = is_ssl_enabled ? website_secure_port : website_port;

		// Start servers.
		server.listen(port, null, () => console.log((is_ssl_enabled ? 'Secure' : 'Insecure') + ' server listening on port ' + port));
		startSocketServer(server, jwt_secret);
		startDeviceServer(server);
		startStreamRelay();
	})
	.catch((error) => console.error(error));
