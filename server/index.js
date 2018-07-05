// ------------------------------  OPEN-AUTOMATION ----------------------------------- //
// -----------------  https://github.com/physiii/open-automation  -------------------- //
// ----------------------------- physiphile@gmail.com -------------------------------- //

const fs = require('fs'),
	path = require('path'),
	express = require('express'),
	startStreamRelay = require('./stream-relay.js'),
	startWebsite = require('./website.js'),
	AccountsManager = require('./accounts/accounts-manager.js'),
	Automator = require('./automator/automator.js'),
	DevicesManager = require('./devices/devices-manager.js');

// Import config or create new config.json with defaults.
try {
	const config = require('../config.json');
} catch (read_error) {
	try {
		fs.writeFileSync(path.join(__dirname, '../', '/config.json'), JSON.stringify({
			use_ssl: false,
			ssl_key_path: '',
			ssl_cert_path: '',
			api_token_issuer: null,
			website_port: 5000,
			website_secure_port: 443,
			video_websocket_port: 8084,
			video_stream_port: 8082,
			device_port: 4000
		}, null, '  '));

		console.log('Created config.json with default configuration.');
	} catch (write_error) {
		throw write_error;
	}
}

AccountsManager.loadAccountsFromDb();
Automator.loadAutomationsFromDb();
DevicesManager.loadDevicesFromDb();

startStreamRelay();
startWebsite(express());
