const WebSocketServer = require('ws').Server;

module.exports = function (server) {
	const socketServer = server;
	console.log(TAG, 'Websocket device server initialized');



	function onConnection (callback) {
		socketServer.on('upgrade', (request, socket, head) => {
			const pathname = url.parse(request.url).pathname;

			switch (pathname){
				case '/tokens':
					break
				case '/buttons':
					break;
				case '/power':
					break;
				case '/LED':
					break;
				case '/microphone':
					break;
				case '/motion':
					break;
				case '/climate':
					break;
				case '/update':
					break;
				default:
					socket.destroy();
					break;
			}
		});
	}
}
