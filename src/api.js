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

	static apiCall (event, payload) {
		return new Promise((resolve, reject) => {
			if (!api.token) {
				reject(new Error('No API token set'));
			}

			api.relaySocket.emit(event, {...payload, user_token: api.token}, (error, data) => {
				if (error) {
					console.error('API error: ' + event, error, data); // TODO: Only log for dev build.
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
