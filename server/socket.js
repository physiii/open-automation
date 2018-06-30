const io = require('socket.io'),
	cookie = require('cookie'),
	TAG = '[socket.js]';

module.exports = function (server) {
	const socketServer = io.listen(server);

	console.log(TAG, 'Started socket server.');

	function onConnection (callback) {
		socketServer.on('connection', (socket) => {
			const device_id = socket.handshake.headers['x-device-id'],
				device_token = socket.handshake.headers['x-device-token'],
				xsrf_token = socket.handshake.headers['x-xsrf-token'],
				cookies = socket.handshake.headers.cookie ? cookie.parse(socket.handshake.headers.cookie) : {},
				access_token = cookies.access_token;

			if (device_id) {
				callback(socket, {device_id, device_token});
			} else {
				callback(socket, {access_token, xsrf_token});
			}
		});
	}

	return {
		server: socketServer,
		onDeviceConnection: (callback) => {
			onConnection((socket, client_info) => {
				if (client_info.device_id) {
					callback(socket, client_info.device_id, client_info.device_token);
				}
			});
		},
		onClientConnection: (callback) => {
			onConnection((socket, client_info) => {
				if (!client_info.device_id) {
					callback(socket, client_info.access_token, client_info.xsrf_token);
				}
			});
		}
	};
}
