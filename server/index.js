// ------------------------------  OPEN-AUTOMATION ----------------------------------- //
// -----------------  https://github.com/physiii/open-automation  -------------------- //
// ----------------------------- physiphile@gmail.com -------------------------------- //

const dotenv = require('dotenv'),
	fs = require('fs'),
	path = require('path'),
	io = require('socket.io'),
	uuidv4 = require('uuid/v4'),
	setUpWebsite = require('./website.js'),
	startHttpServer = require('./http-server.js'),
	startClientApi = require('./client-api.js'),
	startDeviceRelay = require('./device-relay.js'),
	startStreamRelay = require('./stream-relay.js'),
	AccountsManager = require('./accounts/accounts-manager.js'),
	DevicesManager = require('./devices/devices-manager.js'),
	ScenesManager = require('./scenes/scenes-manager.js'),
	Notifications = require('./automator/notifications.js'),
	Automator = require('./automator/automator.js');

let key,
	cert;

dotenv.config();

if (process.env.OA_SSL) {
	key = fs.readFileSync(process.env.OA_SSL_KEY_PATH || (__dirname + '/key.pem'));
	cert = fs.readFileSync(process.env.OA_SSL_CERT_PATH || (__dirname + '/cert.pem'));
}

AccountsManager.init()
	.then(DevicesManager.init)
	.then(ScenesManager.init)
	.then(Notifications.init)
	.then(Automator.init)
	.then(() => {
		const jwt_secret = process.env.OA_JWT_SECRET || key || uuidv4(),
			website = setUpWebsite(jwt_secret),
			http_server = startHttpServer(website, key, cert),
			socket_io_server = io.listen(http_server);

		startClientApi(socket_io_server, jwt_secret);
		startDeviceRelay(http_server, socket_io_server);
		startStreamRelay(http_server);
	})
	.catch((error) => {
		throw error
	});
