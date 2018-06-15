import io from 'socket.io-client';

const SOCKET_CONNECT_TIMEOUT = 20000;

class Api {
	initialize (xsrfToken) {
		this.xsrf_token = xsrfToken;

		return Api.openSocket();
	}

	getDevices () {
		return Api.apiCall('devices/get');
	}

	linkDevice (name, id) {
		return Api.apiCall('link device', {device_name: name, mac: id});
	}

	streamCameraLive (cameraServiceId) {
		return Api.apiCall('camera/stream/live', {service_id: cameraServiceId});
	}

	stopCameraLiveStream (cameraServiceId) {
		return Api.apiCall('camera/stream/stop', {service_id: cameraServiceId});
	}

	getRecordings (cameraServiceId) {
		return Api.apiCall('camera/recordings/get', {service_id: cameraServiceId});
	}

	streamCameraRecording (cameraServiceId, recordingId) {
		return Api.apiCall('camera/recording/stream', {service_id: cameraServiceId, recording_id: recordingId});
	}

	stopCameraRecordingStream (cameraServiceId, recordingId) {
		return Api.apiCall('camera/recording/stream/stop', {service_id: cameraServiceId, recording_id: recordingId});
	}

	static openSocket () {
		return new Promise((resolve, reject) => {
			this.closeSocket();
			api.relaySocket = io();

			// Set a time limit for attempting to open the socket.
			const timeout = setTimeout(() => {
				reject(new Error('Timeout'));
			}, SOCKET_CONNECT_TIMEOUT);

			api.relaySocket.on('connect', () => {
				clearTimeout(timeout);
				resolve();
			});
		});
	}

	static closeSocket () {
		return new Promise((resolve) => {
			if (!api.relaySocket || !api.relaySocket.connected) {
				resolve();

				return;
			}

			api.relaySocket.on('disconnect', resolve);
			api.relaySocket.close();
		});
	}

	static apiCall (event, payload) {
		return new Promise((resolve, reject) => {
			if (!api.relaySocket || !api.relaySocket.connected) {
				reject(new Error('Relay socket not connected.'));

				return;
			}

			api.relaySocket.emit(event, {...payload, xsrf_token: api.xsrf_token}, (error, data) => {
				if (error) {
					console.error('API error: ' + event, error, data); // TODO: Only log for dev build.
					reject(new Error(error));

					return;
				}

				console.log('API response: ' + event, data); // TODO: Only log for dev build.
				resolve(data);
			});
		});
	}
}

const api = new Api();

export default api;
