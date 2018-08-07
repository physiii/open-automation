const io = require('socket.io'),
	cookie = require('cookie'),
	ClientConnection = require('./client-connection.js'),
	DevicesManager = require('./devices/devices-manager.js'),
	TAG = '[socket-server.js]';

module.exports = function (server, jwt_secret) {
	const socketServer = io.listen(server);

	console.log(TAG, 'Started Socket.IO server for devices and clients.');

	socketServer.on('connection', (socket) => {
		const device_id = socket.handshake.headers['x-device-id'],
			device_token = socket.handshake.headers['x-device-token'],
			xsrf_token = socket.handshake.headers['x-xsrf-token'],
			cookies = socket.handshake.headers.cookie ? cookie.parse(socket.handshake.headers.cookie) : {},
			access_token = cookies.access_token;

		if (device_id) {
			DevicesManager.handleDeviceConnection(device_id, device_token, socket);
		} else {
			new ClientConnection(socket, access_token, xsrf_token, jwt_secret);
		}
	});
}
