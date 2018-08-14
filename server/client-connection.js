const AccountsManager = require('./accounts/accounts-manager.js'),
	DevicesManager = require('./devices/devices-manager.js'),
	config = require('../config.json'),
	jwt = require('jsonwebtoken'),
	TAG = '[ClientConnection]';

class ClientConnection {
	constructor (socket, access_token, xsrf_token, jwt_secret) {
		this.socket = socket;
		this.access_token = access_token;
		this.xsrf_token = xsrf_token;
		this.jwt_secret = jwt_secret;

		if (!this.access_token) {
			this.handleAuthenticationError('no access token');
			return;
		}

		// Verify access token at initial API socket connection.
		this.verifyAuthentication().then((account_id) => {
			this.account = AccountsManager.getAccountById(account_id);

			if (!this.account) {
				this.handleAuthenticationError('account not found');
				return;
			}

			// Set up listeners for front-end API.
			this.listenToClient();

			// Push device changes to client.
			DevicesManager.on('devices-update/account/' + this.account.id, (data) => this.socket.emit('devices', {devices: data.devices}));
		});
	}

	verifyAuthentication () {
		return new Promise((resolve, reject) => {
			jwt.verify(this.access_token, this.jwt_secret, {issuer: config.api_token_issuer}, (error, claims) => {
				if (error) {
					reject();
					this.handleAuthenticationError('invalid access token ' + error.name);
					return;
				}

				// Verify CSRF token.
				if (claims.xsrf_token !== this.xsrf_token) {
					reject();
					this.handleAuthenticationError('incorrect XSRF token');
					return;
				}

				resolve(claims.sub);
			});
		});
	}

	handleAuthenticationError (error = 'authentication error') {
		console.log(TAG, 'Closing client socket connection due to authentication error (' + error + ').', this.socket.id);

		this.socket.emit('authentication', {error: error});

		// Closing socket connection on authentication error because the
		// client must reconnect for socket server to get latest cookies.
		this.destroy();
	}

	listenToClient () {
		this.clientEndpoint('devices/get', (data, callback) => {
			if (typeof callback === 'function') {
				const accountDevices = DevicesManager.getDevicesByAccountId(this.account.id);

				callback(null, {devices: DevicesManager.getClientSerializedDevices(accountDevices)});
			}
		});

		this.clientEndpoint('device/add', (data, callback) => {
			DevicesManager.createDevice({
				...data.device,
				token: data.device.id, // All device tokens should start out the same as the ID.
				account_id: this.account.id
			}).then(() => {
				if (typeof callback === 'function') {
					callback(null, {});
				}
			}).catch((error) => {
				console.error(TAG, 'Add device error:', error);

				if (typeof callback === 'function') {
					callback(error, data);
				}
			});
		});

		this.clientEndpoint('device/remove', (data, callback) => {
			const device = data.device;

			DevicesManager.deleteDevice(device.id, this.account.id).then(() => {
				if (typeof callback === 'function') {
					callback(null, {});
				}
			}).catch((error) => {
				console.error(TAG, 'Delete device error:', error);

				if (typeof callback === 'function') {
					callback('There was an error removing the device.');
				}
			});
		});

		// Gateway Service API

		this.clientEndpoint('gateway/devices-to-add/get', (data, callback) => {
			const gatewayService = data.service;

			if (typeof callback === 'function') {
				gatewayService.getDevices().then((data) => {
					const devices = data.devices || [],
						newDevices = devices.filter((device) => !DevicesManager.doesDeviceExist(device.id));

					callback(null, {devices: newDevices});
				}).catch((error) => {
					console.error(TAG, 'Get gateway attached devices error:', error);

					callback('There was an error getting the list of the gateway’s devices.');
				});
			}
		});

		this.clientEndpoint('gateway/command', (data, callback) => {
			const gatewayService = data.service;

			if (!gatewayService.verifyCommandToken(data.command_token)) {
				gatewayService.getCommandToken();

				// NOTE: DO NOT SEND THE COMMAND TOKEN TO THE CLIENT.
				// IT MUST BE READ FROM SERVER LOGS TO GAIN ACCESS.

				if (typeof callback === 'function') {
					callback(null, 'Command token generated.');
				}

				return;
			}

			gatewayService.command(data.command).then((result) => {
				if (typeof callback === 'function') {
					callback(null, result);
				}
			}).catch((error) => {
				if (typeof callback === 'function') {
					callback(error);
				}
			});
		});

		// Camera Service API

		this.clientEndpoint('camera/stream/live', function (data, callback) {
			const cameraService = data.service;

			cameraService.streamLive().then((stream_token) => {
				if (typeof callback === 'function') {
					callback(null, {stream_token});
				}
			}).catch((error) => {
				console.error(TAG, 'Stream error', error);

				if (typeof callback === 'function') {
					callback(error, data);
				}
			});
		});

		this.clientEndpoint('camera/stream/stop', function (data, callback) {
			const cameraService = data.service;

			cameraService.stopLiveStream().then(() => {
				if (typeof callback === 'function') {
					callback(null, {});
				}
			}).catch((error) => {
				if (typeof callback === 'function') {
					callback(error, data);
				}
			});
		});

		this.clientEndpoint('camera/recordings/get', function (data, callback) {
			const cameraService = data.service;

			if (typeof callback === 'function') {
				cameraService.getRecordings().then((recordings) => {
					callback(null, {recordings});
				}).catch((error) => {
					callback(error, data);
				});
			}
		});

		this.clientEndpoint('camera/recording/stream', function (data, callback) {
			const cameraService = data.service;

			cameraService.streamRecording(data.recording_id).then((stream_token) => {
				if (typeof callback === 'function') {
					callback(null, {stream_token});
				}
			}).catch((error) => {
				if (typeof callback === 'function') {
					callback(error, data);
				}
			});
		});

		this.clientEndpoint('camera/recording/stream/stop', function (data, callback) {
			const cameraService = data.service;

			cameraService.stopRecordingStream(data.recording_id).then(() => {
				if (typeof callback === 'function') {
					callback(null, {});
				}
			}).catch((error) => {
				if (typeof callback === 'function') {
					callback(error, data);
				}
			});
		});

		// Lock Service API

		this.clientEndpoint('lock/locked/set', function (data, callback) {
			const lockService = data.service;
			let action;

			if (data.locked === true) {
				action = lockService.lock;
			} else if (data.locked === false) {
				action = lockService.unlock;
			} else {
				callback('Property "locked" must be either true or false.', data);
				return;
			}

			action().then(() => {
				if (typeof callback === 'function') {
					callback(null, {});
				}
			}).catch((error) => {
				if (typeof callback === 'function') {
					callback(error, data);
				}
			});
		});

		this.clientEndpoint('lock/relock-delay/set', function (data, callback) {
			const lockService = data.service;

			lockService.setRelockDelay(data.relock_delay).then(() => {
				if (typeof callback === 'function') {
					callback(null, {});
				}
			}).catch((error) => {
				if (typeof callback === 'function') {
					callback(error, data);
				}
			});
		});

		// Thermostat Service API

		this.clientEndpoint('thermostat/temp/set', function (data, callback) {
			const thermostatService = data.service;

			thermostatService.setTemp(data.temp).then(() => {
				if (typeof callback === 'function') {
					callback(null, {});
				}
			}).catch((error) => {
				if (typeof callback === 'function') {
					callback(error, data);
				}
			});
		});

		this.clientEndpoint('thermostat/mode/set', function (data, callback) {
			const thermostatService = data.service;

			thermostatService.setThermostatMode(data.mode).then(() => {
				if (typeof callback === 'function') {
					callback(null, {});
				}
			}).catch((error) => {
				if (typeof callback === 'function') {
					callback(error, data);
				}
			});
		});

		this.clientEndpoint('thermostat/hold-mode/set', function (data, callback) {
			const thermostatService = data.service;

			thermostatService.setHoldMode(data.mode).then(() => {
				if (typeof callback === 'function') {
					callback(null, {});
				}
			}).catch((error) => {
				if (typeof callback === 'function') {
					callback(error, data);
				}
			});
		});

		this.clientEndpoint('thermostat/fan-mode/set', function (data, callback) {
			const thermostatService = data.service;

			thermostatService.setFanMode(data.mode).then(() => {
				if (typeof callback === 'function') {
					callback(null, {});
				}
			}).catch((error) => {
				if (typeof callback === 'function') {
					callback(error, data);
				}
			});
		});

		// Light Service API

		this.clientEndpoint('light/on', function (data, callback) {
			const lightService = data.service;

			lightService.setPower(true).then(() => {
				if (typeof callback === 'function') {
					callback(null, {});
				}
			}).catch((error) => {
				if (typeof callback === 'function') {
					callback(error, data);
				}
			});
		});

		this.clientEndpoint('light/off', function (data, callback) {
			const lightService = data.service;

			lightService.setPower(false).then(() => {
				if (typeof callback === 'function') {
					callback(null, {});
				}
			}).catch((error) => {
				if (typeof callback === 'function') {
					callback(error, data);
				}
			});
		});

		this.clientEndpoint('light/brightness/set', function (data, callback) {
			const lightService = data.service;

			lightService.setBrightness(data.brightness).then(() => {
				if (typeof callback === 'function') {
					callback(null, {});
				}
			}).catch((error) => {
				if (typeof callback === 'function') {
					callback(error, data);
				}
			});
		});

		this.clientEndpoint('light/color/set', function (data, callback) {
			const lightService = data.service;

			lightService.setColor(data.color).then(() => {
				if (typeof callback === 'function') {
					callback(null, {});
				}
			}).catch((error) => {
				if (typeof callback === 'function') {
					callback(error, data);
				}
			});
		});

		this.clientEndpoint('light/name/set', function (data, callback) {
			const lightService = data.service;

			lightService.setLightName(data.name).then(() => {
				if (typeof callback === 'function') {
					callback(null, {});
				}
			}).catch((error) => {
				if (typeof callback === 'function') {
					callback(error, data);
				}
			});
		});
	}

	clientEndpoint (event, callback, skip_device_lookup) {
		this.socket.on(event, (data = {}, clientCallback) => {
			// Verify access token at each API request. This ensures that
			// the API will stop responding when the access token expires.
			this.verifyAuthentication().then(() => {
				const hydratedData = {
					...data,
					original_data: data
				};

				// Hydrate device
				if (data.device_id && !skip_device_lookup) {
					const device = DevicesManager.getDeviceById(data.device_id, this.account.id);

					if (!device) {
						if (typeof clientCallback === 'function') {
							clientCallback('Device ' + data.device_id + ' not found.', data);
						}

						return;
					}

					hydratedData.device = device;
				}

				// Hydrate service
				if (data.service_id && !skip_device_lookup) {
					const service = DevicesManager.getServiceById(data.service_id, this.account.id);

					if (!service) {
						if (typeof clientCallback === 'function') {
							clientCallback('Service ' + data.service_id + ' not found.', data);
						}

						return;
					}

					hydratedData.service = service;
				}

				callback(hydratedData, clientCallback);
			});
		});
	}

	destroy () {
		this.socket.disconnect();
		delete this.socket;
		delete this.access_token;
		delete this.xsrf_token;
		delete this.account;
	}
}

module.exports = ClientConnection;
