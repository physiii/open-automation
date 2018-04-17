import io from 'socket.io-client';

class Api {
	constructor () {
		this.relaySocket = io();
	}

	setApiToken (token) {
		this.token = token;
	}

	linkUser (username) {
		return Api.apiCall('link user', {user: username});
	}

	getDevices (token) {
		return Api.apiCall('get devices');
	}

	linkDevice (name, id) {
		return Api.apiCall('link device', {device_name: name, mac: id});
	}

	static apiCall (event, payload) {
		return new Promise((resolve, reject) => {
			if (!api.token) {
				throw new Error('No API token set');
			}

			api.relaySocket.emit(event, {...payload, user_token: api.token}, (error, data) => {
				if (error) {
					reject(error); // TODO: Is this a string? If so, throw new Error instead of reject.
				} else {
					resolve(data);
					console.log('API response: ' + event, data);
				}
			});
		});
	}
}

const api = new Api();

export default api;
