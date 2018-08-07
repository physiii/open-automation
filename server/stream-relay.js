const config = require('../config.json'),
	WebSocket = require('ws'),
	http = require('http'),
	https = require('https'),
	fs = require('fs'),
	is_ssl_enabled = config.use_ssl || false,
	stream_relay_port = config.video_stream_port || 5054,
	stream_client_port = config.video_websocket_port || 8085,
	TAG = '[stream-relay.js]';

module.exports = function () {
	let ssl_key,
		ssl_cert,
		stream_relay_server,
		stream_client_server;

	if (is_ssl_enabled) {
		try {
			ssl_key = fs.readFileSync(config.ssl_key_path || (__dirname + '/key.pem'));
			ssl_cert = fs.readFileSync(config.ssl_cert_path || (__dirname + '/cert.pem'));
		} catch (error) {
			console.error('There was an error when trying to load SSL files.', error);

			return;
		}
	}

	const credentials = {key: ssl_key, cert: ssl_cert};

	// Websocket server for video-streaming client on front-end.
	if (is_ssl_enabled) {
		stream_client_server = new WebSocket.Server({
			server: https.createServer(credentials).listen(stream_client_port)
		});
	} else {
		stream_client_server = new WebSocket.Server({port: stream_client_port, perMessageDeflate: false});
	}

	// Listen for new connections from front-end.
	stream_client_server.on('connection', (socket) => {
		// TODO: Require user authentication to stream.

		// Receive stream id and token from front-end.
		socket.onmessage = function (event) {
			const data = JSON.parse(event.data);

			socket.stream_id = data.stream_id;
			socket.stream_token = data.stream_token;

			console.log(TAG, 'Stored token for stream', socket.stream_id);
		}
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

	// HTTP Server to accept incomming MPEG streams.
	if (is_ssl_enabled) {
		stream_relay_server = https.createServer(credentials, requestListener);
	} else {
		stream_relay_server = http.createServer(requestListener);
	}

	stream_relay_server.listen(stream_relay_port);

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

	console.log(TAG, 'Started video streaming server. Listening for incoming streams at ' + (is_ssl_enabled ? 'https' : 'http') + '://localhost:' + stream_relay_port + '/<stream id>/<stream token>. Serving streams at ' + (is_ssl_enabled ? 'wss' : 'ws') + '://localhost:' + stream_client_port + '.');
};
