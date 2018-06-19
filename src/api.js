import io from 'socket.io-client';
import axios from 'axios';

const listeners = [],
	SOCKET_CONNECT_TIMEOUT = 20000,
	GENERIC_LOGIN_ERROR = 'An error occurred while trying to log in.';

class Api {
	connect () {
		return new Promise((resolve, reject) => {
			Api.openSocket().then(() => {
				resolve();
			}).catch((error) => {
				reject(new Error(error));
			});
		});
	}

	on (event, callback) {
		listeners.push({event, callback});

		if (this.relaySocket && this.relaySocket.connected) {
			this.relaySocket.on(event, callback);
		}
	}

	getDevices () {
		return Api.apiCall('devices/get');
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

	// Session API

	login (username, password) {
		return new Promise((resolve, reject) => {
			axios.post('/api/login', {username, password}).then((response) => {
				// Store the CSRF token.
				localStorage.setItem('xsrf_token', response.data.xsrf_token);

				// Connect to Socket.io API.
				this.connect().then(() => {
					resolve(response.data.account);
				}).catch(() => {
					reject(new Error(GENERIC_LOGIN_ERROR));
				});
			}).catch((error) => {
				const unauthorizedErrorCode = 401;
				let errorMessage = GENERIC_LOGIN_ERROR;

				if (error.response && error.response.status === unauthorizedErrorCode) {
					errorMessage = 'Username or password is incorrect.';
				}

				reject(new Error(errorMessage));
			});
		});
	}

	logout () {
		return new Promise((resolve, reject) => {
			axios.post('/api/logout', null).then(() => {
				Api.closeSocket().then(resolve);
			}).catch(() => {
				reject(new Error('An error occurred while trying to log out.'));
			});
		});
	}

	getAccount () {
		return new Promise((resolve, reject) => {
			axios.get('/api/account', {headers: {'X-XSRF-TOKEN': localStorage.getItem('xsrf_token')}}).then((response) => {
				resolve(response.data.account);
			}).catch(() => {
				reject(new Error('Could not retrieve account information.'));
			});
		});
	}

	createAccount (accountData) {
		return new Promise((resolve, reject) => {
			axios.post('/api/account', {
				username: accountData.username,
				password: accountData.password
			}).then((response) => {
				resolve(response.data.account);
			}).catch((error) => {
				const usernameConflictErrorCode = 409;
				let errorMessage = 'An error occurred while trying to create the account.';

				if (error.response && error.response.status === usernameConflictErrorCode) {
					errorMessage = 'An account already exists with that username.';
				}

				reject(new Error(errorMessage));
			});
		});
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

			// Set up listeners on new socket connection.
			listeners.forEach(({event, callback}) => {
				api.relaySocket.on(event, callback);
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

			api.relaySocket.emit(event, {...payload, xsrf_token: localStorage.getItem('xsrf_token')}, (error, data) => {
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
