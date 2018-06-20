// ------------------------------  OPEN-AUTOMATION ----------------------------------- //
// -----------------  https://github.com/physiii/open-automation  -------------------- //
// ---------------------------------- stream.js -------------------------------------- //

const config = require('../config.json'),
	WebSocket = require('ws'),
	http = require('http'),
	https = require('https'),
	fs = require('fs'),
	IS_SSL_ENABLED = config.use_ssl || false,
	STREAM_PORT = config.video_stream_port || 5054,
	WEBSOCKET_PORT = config.video_websocket_port || 8085,
	TAG = '[stream.js]';

let socketConnectionCount = 0,
	ssl_key, ssl_cert, socketServer, streamServer;

if (IS_SSL_ENABLED) {
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
if (IS_SSL_ENABLED) {
	socketServer = new WebSocket.Server({
		server: https.createServer(credentials).listen(WEBSOCKET_PORT)
	});
} else {
	socketServer = new WebSocket.Server({port: WEBSOCKET_PORT, perMessageDeflate: false});
}

// Listen for new connections from front-end.
socketServer.on('connection', (socket) => {
	socketConnectionCount++;

	console.log(TAG, 'Video socket opened (' + socketConnectionCount + ' total).');

	// TODO: Require user authentication to stream.

	// Receive stream id and token from front-end.
	socket.onmessage = function (event) {
		const data = JSON.parse(event.data);

		socket.stream_id = data.stream_id;
		socket.stream_token = data.stream_token;

		console.log(TAG, 'Stored token for stream', socket.stream_id);
	}
});
socketServer.on('disconnect', () => {
	socketConnectionCount--;
});

// Broadcast stream to client (front-end).
function clientBroadcast (data, settings) {
	// TODO: Instead of forEach, filter for the clients with the correct stream_id and stream_token.
	socketServer.clients.forEach((client) => {
		if (client.readyState !== WebSocket.OPEN) {
			console.log('Client not connected (' + i + ')');
			return;
		}

		// If this client's stream id and token match, broadcast.
		if (client.stream_id === settings.stream_id && client.stream_token === settings.stream_token) {
			client.send(data);
		}
	});
};

// HTTP Server to accept incomming MPEG streams.
if (IS_SSL_ENABLED) {
	streamServer = https.createServer(credentials, requestListener);
} else {
	streamServer = http.createServer(requestListener);
}

streamServer.listen(STREAM_PORT);

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

console.log(TAG, 'Listening for MPEG stream on ' + (IS_SSL_ENABLED ? 'https' : 'http') + '://127.0.0.1:' + STREAM_PORT + '/<stream id>/<stream token>/');
console.log(TAG, 'Awaiting WebSocket connections on ' + (IS_SSL_ENABLED ? 'wss' : 'ws') + '://127.0.0.1:' + WEBSOCKET_PORT + '/');
