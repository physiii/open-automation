import io from 'socket.io-client';

let relaySocket = io();

class Api {
	linkUser (username, token) {
		relaySocket.emit('link user', {user: username, token: token});
	}
}

let api = new Api();

export default api;
