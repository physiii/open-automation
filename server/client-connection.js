const AccountsManager = require('./accounts/accounts-manager.js'),
	DevicesManager = require('./devices/devices-manager.js'),
	AutomationsManager = require('./automator/automations-manager.js'),
	jwt = require('jsonwebtoken'),
	TAG = '[ClientConnection]';

class ClientConnection {
	constructor (socket, access_token, xsrf_token, jwt_secret) {
		this.socket = socket;
		this.access_token = access_token;
		this.xsrf_token = xsrf_token;
		this.jwt_secret = jwt_secret;

		this.handleRoomsUpdate = this.handleRoomsUpdate.bind(this);
		this.handleAccountDevicesUpdate = this.handleAccountDevicesUpdate.bind(this);
		this.handleAccountAutomationsUpdate = this.handleAccountAutomationsUpdate.bind(this);

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

			// Push changes to client.
			this.account.on('rooms-updated', this.handleRoomsUpdate);
			DevicesManager.on('devices-update/account/' + this.account.id, this.handleAccountDevicesUpdate);
			AutomationsManager.on('automations-update/account/' + this.account.id, this.handleAccountAutomationsUpdate);

			this.destroy = this.destroy.bind(this, this.account.id);

			this.socket.on('disconnect', (reason) => {
				if (reason === 'transport close') {
					this.destroy();
				}
			});
		});
	}

	verifyAuthentication () {
		return new Promise((resolve, reject) => {
			jwt.verify(this.access_token, this.jwt_secret, {issuer: process.env.OA_API_TOKEN_ISSUER}, (error, claims) => {
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

	handleRoomsUpdate ({clientSerializedRooms}) {
		this.socket.emit('rooms', {rooms: clientSerializedRooms});
	}

	handleAccountDevicesUpdate ({devices}) {
		this.socket.emit('devices', {devices});
	}

	handleAccountAutomationsUpdate ({automations}) {
		this.socket.emit('automations', {automations});
	}

	listenToClient () {
		this.clientEndpoint('armed/set', (data, callback) => {
			this.account.setArmed(data.mode).then((mode) => callback(null, {mode})).catch((error) => {
				console.error(TAG, 'Set armed error:', error);
				callback(error, {mode: this.account.armed});
			});
		});

		this.clientEndpoint('automations/get', (data, callback) => {
			AutomationsManager.getAutomationsByAccountId(this.account.id).then((accountAutomations) => {
				callback(null, {automations: AutomationsManager.clientSerializeAutomations(accountAutomations)});
			}).catch((error) => {
				console.error(TAG, 'Get automations error:', error);
				callback(error);
			});
		});

		this.clientEndpoint('automation/add', (data, callback) => {
			AutomationsManager.saveAutomation({
					...data.automation,
					type: 'user',
					source: {web: true},
					user_editable: true,
					account_id: this.account.id
				})
				.then((automation) => callback(null, {automation}))
				.catch((error) => {
					console.error(TAG, 'Add automation error:', error);
					callback(error);
				});
		});

		this.clientEndpoint('automation/save', (data, callback) => {
			const automation = AutomationsManager.getAutomationById(data.automation.id, this.account.id);

			if (!automation.user_editable) {
				callback('This automation cannot be modified.');
				return;
			}

			if (automation.user_editable.name === false && data.automation.name !== automation.name) {
				callback('This automation’s name cannot be modified.');
				return;
			}

			if (automation.user_editable.is_enabled === false && data.automation.is_enabled !== automation.is_enabled) {
				callback('This automation cannot be disabled.');
				return;
			}

			if (automation.user_editable.triggers === false && JSON.stringify(data.automation.triggers) !== JSON.stringify(automation.triggers)) {
				callback('This automation’s triggers cannot be modified.');
				return;
			}

			if (automation.user_editable.conditions === false && JSON.stringify(data.automation.conditions) !== JSON.stringify(automation.conditions)) {
				callback('This automation’s conditions cannot be modified.');
				return;
			}

			if (automation.user_editable.notifications === false && JSON.stringify(data.automation.notifications) !== JSON.stringify(automation.notifications)) {
				callback('This automation’s notifications cannot be modified.');
				return;
			}

			if (automation.user_editable.scenes === false && JSON.stringify(data.automation.scenes) !== JSON.stringify(automation.scenes)) {
				callback('This automation’s scenes cannot be modified.');
				return;
			}

			AutomationsManager.saveAutomation({
					...data.automation,
					type: automation.type, // Ignore changes from client.
					source: automation.source, // Ignore changes from client.
					user_editable: automation.user_editable, // Ignore changes from client.
					account_id: this.account.id
				})
				.then((automation) => callback(null, {automation}))
				.catch((error) => {
					console.error(TAG, 'Add automation error:', error);
					callback(error);
				});
		});

		this.clientEndpoint('automation/delete', (data, callback) => {
			const automation = AutomationsManager.getAutomationById(data.automation_id, this.account.id);

			if (!automation.user_editable || (automation.user_editable && automation.user_editable.delete === false)) {
				callback('This automation cannot be deleted.');
				return;
			}

			AutomationsManager.deleteAutomation(data.automation_id, this.account.id)
				.then(() => callback())
				.catch((error) => {
					console.error(TAG, 'Delete automation error:', error);
					callback(error);
				});
		});

		this.clientEndpoint('rooms/get', (data, callback) => {
			callback(null, {rooms: this.account.rooms.clientSerialize()});
		});

		this.clientEndpoint('room/add', (data, callback) => {
			this.account.rooms.addRoom(data.name)
				.then((room) => callback(null, {room}))
				.catch((error) => {
					console.error(TAG, 'Add room error:', error);
					callback(error);
				});
		});

		this.clientEndpoint('room/delete', (data, callback) => {
			this.account.rooms.deleteRoom(data.room_id)
				.then(() => callback())
				.catch((error) => {
					console.error(TAG, 'Delete room error:', error);
					callback(error);
				});
		});

		this.clientEndpoint('room/name/set', (data, callback) => {
			this.account.rooms.setRoomName(data.room_id, data.name)
				.then((room) => callback(null, {room}))
				.catch((error) => {
					console.error(TAG, 'Name room error:', error);
					callback(error);
				});
		});

		this.clientEndpoint('rooms/sort', (data, callback) => {
			this.account.rooms.sortRooms(data.order)
				.then((rooms) => callback(null, {rooms}))
				.catch((error) => {
					console.error(TAG, 'Sort rooms error:', error);
					callback(error);
				});
		});

		this.clientEndpoint('devices/get', (data, callback) => {
			const accountDevices = DevicesManager.getDevicesByAccountId(this.account.id);

			callback(null, {devices: DevicesManager.getClientSerializedDevices(accountDevices)});
		});

		this.clientEndpoint('device/add', (data, callback) => {
			DevicesManager.createDevice({
				...data.device,
				token: data.device.id, // All device tokens should start out the same as the ID.
				account_id: this.account.id
			})
				.then(() => callback())
				.catch((error) => {
					console.error(TAG, 'Add device error:', error);
					callback('There was an error adding the device.');
				});
		});

		this.clientEndpoint('device/settings/set', (data, callback) => {
			data.device.setSettings(data.settings)
				.then(() => callback())
				.catch(callback);
		});

		this.clientEndpoint('device/room/set', (data, callback) => {
			const room = this.account.rooms.getRoomById(data.room_id);

			if (!room) {
				callback('The room does not exist.');
				return;
			}

			data.device.setRoom(data.room_id)
				.then(() => callback())
				.catch((error) => {
					console.error(TAG, 'Set device room error:', error);
					callback('There was an error setting the device’s room.');
				})
		});

		this.clientEndpoint('device/delete', (data, callback) => {
			DevicesManager.deleteDevice(data.device.id, this.account.id)
				.then(() => callback())
				.catch((error) => {
					console.error(TAG, 'Delete device error:', error);
					callback('There was an error deleting the device.');
				});
		});

		this.clientEndpoint('device/update', (data, callback) => {
			DevicesManager.updateDevice(data.device.id, this.account.id)
				.then(() => callback())
				.catch((error) => {
					console.error(TAG, 'Update device error:', error);
					callback('There was an error updating the device.');
				});
		});

		this.clientEndpoint('device/log/get', (data, callback) => {
			DevicesManager.getDeviceLog(data.service_id, this.account.id)
			.then((log) => callback(null, {log}))
			.catch(callback);
		});

		this.clientEndpoint('service/action', (data, callback) => {
			data.service.action(data.action)
				.then(() => callback())
				.catch(callback);
		});

		this.clientEndpoint('service/settings/set', (data, callback) => {
			data.service.setSettings(data.settings)
				.then(() => callback())
				.catch(callback);
		});

		this.clientEndpoint('service/log/get', (data, callback) => {
			data.service.getLog()
				.then((log) => callback(null, {log}))
				.catch(callback);
		});

		// Gateway Service API

		this.clientEndpoint('gateway/devices-to-add/get', (data, callback) => {
			data.service.getDevices()
				.then((data) => {
					const devices = data.devices || [],
						newDevices = devices.filter((device) => !DevicesManager.doesDeviceExist(device.id));

					callback(null, {devices: newDevices});
				})
				.catch((error) => {
					console.error(TAG, 'Get gateway attached devices error:', error);

					callback('There was an error getting the list of the gateway’s devices.');
				});
		});

		this.clientEndpoint('gateway/command', (data, callback) => {
			const gatewayService = data.service;

			if (!gatewayService.verifyCommandToken(data.command_token)) {
				gatewayService.getCommandToken();

				// WARNING: DO NOT SEND THE COMMAND TOKEN TO THE CLIENT. IT
				// MUST BE READ FROM SERVER LOGS TO GAIN ACCESS.

				callback(null, 'Command token generated.');

				return;
			}

			gatewayService.command(data.command)
				.then((result) => callback(null, result))
				.catch((error) => callback(error));
		});

		// Camera Service API

		this.clientEndpoint('audio/stream/live', function (data, callback) {
			data.service.streamLiveAudio()
				.then((stream_token) => callback(null, {stream_token}))
				.catch((error) => {
					console.error(TAG, 'Stream error', error);

					callback(error);
				});
		});

		this.clientEndpoint('audio/stream/stop', function (data, callback) {
			data.service.stopLiveStreamAudio()
				.then(() => callback())
				.catch((error) => callback(error));
		});

		this.clientEndpoint('camera/stream/live', function (data, callback) {
			data.service.streamLive()
				.then((stream_token) => callback(null, {stream_token}))
				.catch((error) => {
					console.error(TAG, 'Stream error', error);

					callback(error);
				});
		});

		this.clientEndpoint('camera/stream/stop', function (data, callback) {
			data.service.stopLiveStream()
				.then(() => callback())
				.catch((error) => callback(error));
		});

		this.clientEndpoint('camera/recordings/get', function (data, callback) {
			data.service.getRecordings()
				.then((recordings) => callback(null, {recordings}))
				.catch((error) => callback(error));
		});

		this.clientEndpoint('camera/recording/stream/audio', function (data, callback) {
			data.service.streamAudioRecording(data.recording_id)
				.then((stream_token) => callback(null, {audio_stream_token: stream_token}))
				.catch((error) => callback(error));
		});

		this.clientEndpoint('camera/recording/stream/audio/stop', function (data, callback) {
			data.service.stopAudioRecordingStream(data.recording_id)
				.then(() => callback())
				.catch((error) => callback(error));
		});

		this.clientEndpoint('camera/recording/stream', function (data, callback) {
			data.service.streamRecording(data.recording_id)
				.then((stream_token) => callback(null, {stream_token}))
				.catch((error) => callback(error));
		});

		this.clientEndpoint('camera/recording/stream/stop', function (data, callback) {
			data.service.stopRecordingStream(data.recording_id)
				.then(() => callback())
				.catch((error) => callback(error));
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
				callback('Property "locked" must be either true or false.');
				return;
			}

			action()
				.then(() => callback())
				.catch((error) => callback(error));
		});

		// Thermostat Service API

		this.clientEndpoint('thermostat/temp/set', function (data, callback) {
			data.service.setTemp(data.temp)
				.then(() => callback())
				.catch((error) => callback(error));
		});

		this.clientEndpoint('thermostat/mode/set', function (data, callback) {
			data.service.setThermostatMode(data.mode)
				.then(() => callback())
				.catch((error) => callback(error));
		});

		this.clientEndpoint('thermostat/hold-mode/set', function (data, callback) {
			data.service.setHoldMode(data.hold_mode)
				.then(() => callback())
				.catch((error) => callback(error));
		});

		this.clientEndpoint('thermostat/fan-mode/set', function (data, callback) {
			data.service.setFanMode(data.fan_mode)
				.then(() => callback())
				.catch((error) => callback(error));
		});

		// Light Service API

		this.clientEndpoint('light/on', function (data, callback) {
			data.service.setPower(true)
				.then(() => callback())
				.catch((error) => callback(error));
		});

		this.clientEndpoint('light/off', function (data, callback) {
			data.service.setPower(false)
				.then(() => callback())
				.catch((error) => callback(error));
		});

		this.clientEndpoint('light/brightness/set', function (data, callback) {
			data.service.setBrightness(data.brightness)
				.then(() => callback())
				.catch((error) => callback(error));
		});

		this.clientEndpoint('light/color/set', function (data, callback) {
			data.service.setColor(data.color)
				.then(() => callback())
				.catch((error) => callback(error));
		});

		// Game Machine Service API

		this.clientEndpoint('game-machine/credit/add', function (data, callback) {
			data.service.addCredit(data.dollar_value)
				.then(() => callback())
				.catch((error) => callback(error));
		});
	}

	clientEndpoint (event, callback, skip_device_lookup) {
		this.socket.on(event, (data = {}, clientCallback = () => { /* no-op */ }) => {
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
						clientCallback('Device ' + data.device_id + ' not found.');

						return;
					}

					hydratedData.device = device;
				}

				// Hydrate service
				if (data.service_id && !skip_device_lookup) {
					const service = DevicesManager.getServiceById(data.service_id, this.account.id);

					if (!service) {
						clientCallback('Service ' + data.service_id + ' not found.');

						return;
					}

					hydratedData.service = service;
				}

				callback(hydratedData, clientCallback);
			});
		});
	}

	destroy (accountId) {
		if (this.account) {
			this.account.off('rooms-updated', this.handleRoomsUpdate);
		}

		DevicesManager.off('devices-update/account/' + accountId, this.handleAccountDevicesUpdate);
		AutomationsManager.off('automations-update/account/' + accountId, this.handleAccountAutomationsUpdate);

		if (this.socket) {
			this.socket.removeAllListeners();
			this.socket.disconnect();
		}

		delete this.socket;
		delete this.access_token;
		delete this.xsrf_token;
		delete this.account;
	}
}

module.exports = ClientConnection;
