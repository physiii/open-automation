const WebSocket = require('ws'),
	DevicesManager = require('./devices/devices-manager.js'),
	DeviceWebSocketWrapper = require('./devices/device-websocket-wrapper.js'),
	TAG = '[device-server.js]';

module.exports = (server) => {
	const device_server = new WebSocket.Server({server});

	console.log(TAG, 'Started WebSocket server for devices.');

	device_server.on('connection', (socket, request) => {
		const device_id = request.headers['x-device-id'],
			device_token = request.headers['x-device-token'];

		if (!device_id) {
			// Connection is not a device.
			return;
		}

		DevicesManager.handleDeviceConnection(device_id, device_token, new DeviceWebSocketWrapper(socket));

		socket.on('message', (message) => console.log(JSON.parse(message)));
	});
};
