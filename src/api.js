import io from 'socket.io-client';

let relaySocket = io();

class Api {
	constructor () {
		relaySocket.on('get devices', (data) => {
			console.log('get devices', data);

			let devices = data;

			devices.forEach((device) => {
				if (device.type === 'gateway') {
					console.log('gateway - get settings', device);
					relaySocket.emit('get settings', {token: device.token});
				}
			});
		});

		relaySocket.on('load settings', (data) => {
			console.log('load settings', data);
		});
	}

	linkUser (username, token) {
		relaySocket.emit('link user', {user: username, token: token});
	}

	getDevices (token) {
		relaySocket.emit('get devices', {token});
	}

	linkDevice (name, id, token) {
		relaySocket.emit('link device', {
			device_name: name,
			mac: id,
			user_token: token
		});
	}
}

let api = new Api();

export default api;
