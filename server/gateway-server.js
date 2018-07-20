const DevicesManager = require('./devices/devices-manager.js'),
	TAG = '[gateway-server.js]';

module.exports = function (onConnection) {
	console.log(TAG, 'Gateway device server initialized.');

	onConnection((socket, device_id, device_token) => {
		if (!device_id) {
			// If there's no device_id, this client isn't a gateway device.
			return;
		}

		const device = DevicesManager.getDeviceById(device_id, null, true);

		// If the device doesn't exist, store the socket in escrow to be used
		// when the device is added.
		if (!device) {
			console.log(TAG, 'Unknown device connected.', device_id);

			DevicesManager.addToSocketEscrow(device_id, device_token, socket);

			return;
		}

		// Device token is invalid.
		if (!device.verifyToken(device_token)) {
			console.log(TAG, 'Closing gateway device socket connection due to invalid device token.', socket.id);

			socket.emit('authentication', {error: 'invalid token'});

			socket.disconnect();

			return;
		}

		console.log(TAG, 'Device connected.', device_id);

		// Update the socket on the device.
		device.setGatewaySocket(socket, device_token);
	});
};
