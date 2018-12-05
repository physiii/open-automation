const url = require('url'),
	WebSocket = require('ws'),
	DevicesManager = require('./devices/devices-manager.js'),
	DeviceWebSocketWrapper = require('./devices/device-websocket-wrapper.js'),
	WEBSOCKET_DEVICE_PATH = '/device-relay',
	SOCKET_IO_NAMESPACE = '/device-relay',
	TAG = '[device-relay.js]';

function handleDeviceConnection (socket, headers) {
	const device_id = headers['x-device-id'],
		device_token = headers['x-device-token'],
		device_type = headers['x-device-type'];

	socket.on('error', (error) => console.error(TAG, device_id, 'Connection error:', error));

	if (!device_id) {
		// Connection is not a device.
		return;
	}

	DevicesManager.handleDeviceConnection(device_id, device_token, device_type, socket);
}

module.exports = (http_server, socket_io_server) => {
	const websocket_server = new WebSocket.Server({noServer: true});

	// Handle websocket server errors.
	websocket_server.on('error', (error) => console.error(TAG, 'Server error:', error));

	// Listen for devices connecting over WebSockets.
	http_server.on('upgrade', (request, ws, head) => {
		// Only listen to device connections.
		if (url.parse(request.url).pathname !== WEBSOCKET_DEVICE_PATH) {
			return;
		}

		websocket_server.handleUpgrade(request, ws, head, (socket) => handleDeviceConnection(new DeviceWebSocketWrapper(socket), request.headers));
	});

	console.log(TAG, 'Listening for WebSocket device connections at ' + (process.env.OA_SSL ? 'wss': 'ws') + '://localhost:' + http_server.address().port + WEBSOCKET_DEVICE_PATH + '.');

	// Listen for devices connecting over Socket.IO.
	socket_io_server.of(SOCKET_IO_NAMESPACE).on('connection', (socket) => handleDeviceConnection(socket, socket.handshake.headers));

	console.log(TAG, 'Listening for Socket.IO device connections on namespace ' + SOCKET_IO_NAMESPACE + '.');
};
