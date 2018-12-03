const WebSocket = require('ws'),
	url = require('url'),
	http = require('http'),
	https = require('https'),
	fs = require('fs'),
	WEBSOCKET_STREAM_PATH = '/stream-relay',
	TAG = '[stream-relay.js]';

module.exports = function (website_server, key, cert) {
	let stream_relay_server;

	// Websocket server for video-streaming client on front-end.
	const stream_client_server = new WebSocket.Server({noServer: true});
	website_server.on('upgrade', (request, ws, head) => {
		// Only listen to stream relay connections.
		if (url.parse(request.url).pathname !== WEBSOCKET_STREAM_PATH) {
			return;
		}

		stream_client_server.handleUpgrade(request, ws, head, (socket) => stream_client_server.emit('connection', socket, request));
	});

	// Listen for new connections from front-end.
	stream_client_server.on('connection', (socket, request) => {
		const query_parameters = url.parse(request.url, true).query;

		// TODO: Require user authentication to stream.

		socket.stream_id = query_parameters.stream_id;
		socket.stream_token = query_parameters.stream_token;
	});

	// Broadcast stream to client (front-end).
	function clientBroadcast (data, settings) {
		stream_client_server.clients.forEach((client) => {
			if (client.readyState !== WebSocket.OPEN) {
				return;
			}

			// If this client's stream id and token match, broadcast.
			if (client.stream_id === settings.stream_id && client.stream_token === settings.stream_token) {
				client.send(data);
			}
		});
	};

	// HTTP Server to accept incoming MPEG streams.
	if (process.env.OA_SSL) {
		stream_relay_server = https.createServer({key, cert}, requestListener);
	} else {
		stream_relay_server = http.createServer(requestListener);
	}

	stream_relay_server.listen(process.env.OA_VIDEO_RELAY_PORT || 5054);

	function requestListener (request, response) {
		const params = request.url.substr(1).split('/'),
			stream_id = params[0],
			stream_token = params[1];

		// TODO: Validate that the stream is coming from a known device.

		response.connection.setTimeout(0);

		console.log(TAG, 'Incoming stream: ', stream_id);

		// Broadcast the stream to the client (front-end).
		request.on('data', function (data) {
			clientBroadcast(data, {stream_id, stream_token});
		});
	}

	console.log(TAG, 'Listening for incoming video streams at ' + (process.env.OA_SSL ? 'https' : 'http') + '://localhost:' + stream_relay_server.address().port + '/<stream id>/<stream token>. Serving video streams at ' + (process.env.OA_SSL ? 'wss' : 'ws') + '://localhost:' + website_server.address().port + WEBSOCKET_STREAM_PATH + '.');
};
