const url = require('url'),
	WebSocket = require('ws'),
	uuidV4 = require('uuid/v4'),
	UTILITIES_SERVER_PATH = '/utilities',
	TAG = '[utilities-server.js]',
	DEFAULT_TIME = '0001-01-01T12:00:00.000Z',
	HOURS = 12,
	MINUTES = 60,
	MINUTE_WIDTH = 2;

module.exports = (http_server) => {
	const websocket_server = new WebSocket.Server({noServer: true});

	// Handle websocket server errors.
	websocket_server.on('error', (error) => console.error(TAG, 'Server error:', error));

	// Listen for devices connecting over WebSockets.
	http_server.on('upgrade', (request, ws, head) => {
		// Only listen to device connections.
		if (url.parse(request.url).pathname !== UTILITIES_SERVER_PATH) {
			return;
		}

		websocket_server.handleUpgrade(request, ws, head, (socket) => {
			socket.on('message', (data) => {
				let message;

				try {
					message = JSON.parse(data);
				} catch (error) {
					return;
				}

				if (message.event_type === 'generate-uuid') {
					socket.send(JSON.stringify({
						id: message.id,
						callback: true,
						payload: {uuid: uuidV4()}
					}));
				}

				if (message.event_type === 'time') {
					socket.send(JSON.stringify({
						id: message.id,
						callback: true,
						event_type: "time",
						payload: {time: Math.trunc(Date.now() / 1000)}
					}));
				}

			});
		});
	});
};
