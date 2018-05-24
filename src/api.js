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

	getDevices () {
		return Api.apiCall('devices/get');
	}

	linkDevice (name, id) {
		return Api.apiCall('link device', {device_name: name, mac: id});
	}

	stream (command, deviceToken, cameraServiceId, file) {
		const options = {
			command,
			token: deviceToken,
			camera_service_id: cameraServiceId
		};

		if (file) {
			options.file = file;
		}

		return Api.apiCall('ffmpeg', options);
	}

	getRecordings (serviceId) {
		return Api.apiCall('camera/recordings/get', {service_id: serviceId});
	}

	static apiCall (event, payload) {
		return new Promise((resolve, reject) => {
			if (!api.token) {
				reject(new Error('No API token set'));
			}

			api.relaySocket.emit(event, {...payload, user_token: api.token}, (error, data) => {
				if (error) {
					console.error('API error: ' + event, error); // TODO: Only log for dev build.
					reject(new Error(error));
				} else {
					console.log('API response: ' + event, data); // TODO: Only log for dev build.
					resolve(data);
				}
			});
		});
	}
}

const api = new Api();

export default api;
