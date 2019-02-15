const cookie = require('cookie'),
	ClientConnection = require('./client-connection.js'),
	SOCKET_IO_NAMESPACE = '/client-api',
	TAG = '[client-api.js]';

module.exports = function (socket_io_server, jwt_secret) {
	socket_io_server.of(SOCKET_IO_NAMESPACE).on('connection', (socket) => {
		const cookies = socket.handshake.headers.cookie ? cookie.parse(socket.handshake.headers.cookie) : {};

		new ClientConnection(socket, cookies.access_token, socket.handshake.headers['x-xsrf-token'], jwt_secret);
	});

	console.log(TAG, 'Listening for Socket.IO Client API connections on namespace ' + SOCKET_IO_NAMESPACE + '.');
}
