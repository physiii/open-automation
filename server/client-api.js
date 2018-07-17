const AccountsManager = require('./accounts/accounts-manager.js'),
	DevicesManager = require('./devices/devices-manager.js'),
	config = require('../config.json'),
	jwt = require('jsonwebtoken'),
	nodemailer = require('nodemailer'),
	smtpTransport = require('nodemailer-smtp-transport'),
	CELL_PROVIDERS = {
		'ATT':'@txt.att.net',
		'TMobile':'@tmomail.net',
		'Verizon':'@vtext.com',
		'Sprint':'@messaging.sprintpcs.com',
		'VirginMobile':'@vmobl.com',
		'Tracfone':'@mmst5.tracfone.com',
		'MetroPCS':'@mymetropcs.com',
		'Boost':'@sms.myboostmobile.com',
		'Cricket':'@sms.cricketwireless.net',
		'US_Cellular':'@email.uscc.net'
	};
	TAG = '[client-api.js]';

if (config.mail) {
	var transporter = nodemailer.createTransport(
		smtpTransport({
			service: config.mail.service,
			auth: {
				user: config.mail.from_user,
				pass: config.mail.password
			}
		})
	);
}

function sendEmail (to, subject, message) {
	const mailOptions = {
		from: config.mail.from_user,
		to,
		subject,
		html: message,
	};

	transpoter.sendMail(mailOptions, (error) => {
		if (error) {
			consol.log(error);
		}
	});
}

function verifyAuthentication (access_token, jwt_secret, xsrf_token) {
	return new Promise((resolve, reject) => {
		jwt.verify(access_token, jwt_secret, {issuer: config.api_token_issuer}, (error, claims) => {
			if (error) {
				reject();
				handleAuthenticationError('invalid access token ' + error.name);
				return;
			}

			// Verify CSRF token.
			if (xsrf_token !== claims.xsrf_token) {
				reject();
				handleAuthenticationError('incorrect XSRF token');
				return;
			}

			resolve(claims.sub);
		});
	});
}

module.exports = function (onConnection, jwt_secret) {
	console.log(TAG, 'Client API initialized.');

	// Push device changes.
	DevicesManager.on('device/update', (data) => {
		const device = data.device,
			device_account_id = device.account && device.account.id,
			account = AccountsManager.getAccountById(device_account_id),
			client_sockets = (account && account.getClientSockets()) || [],
			devices = DevicesManager.getClientSerializedDevices(DevicesManager.getDevicesByAccountId(device_account_id));

		if (!account) {
			console.error(TAG, 'Device Update - Could not find account for device', device.id);

			return;
		}

		client_sockets.forEach((socket) => {
			socket.emit('devices', {devices});
		});
	});

	// Client connection
	onConnection((socket, access_token, xsrf_token) => {
		function handleAuthenticationError (error = 'authentication error') {
			console.log(TAG, 'Closing client socket connection due to authentication error (' + error + ').', socket.id);

			socket.emit('authentication', {error: error});

			// Closing socket connection on authentication error because the
			// client must reconnect for socket server to get latest cookies.
			socket.disconnect();
		}

		if (!access_token) {
			handleAuthenticationError('no access token');
			return;
		}

		// Verify access token at initial API socket connection.
		verifyAuthentication(access_token, jwt_secret, xsrf_token).then((account_id) => {
			const account = AccountsManager.getAccountById(account_id);

			function clientEndpoint (event, callback, skip_device_lookup) {
				socket.on(event, (data = {}, clientCallback) => {
					// Verify access token at each API request. This ensures that
					// the API will stop responding when the access token expires.
					verifyAuthentication(access_token, jwt_secret, xsrf_token).then(() => {
						const hydratedData = {
							...data,
							original_data: data
						};

						// Hydrate device
						if (data.device_id && !skip_device_lookup) {
							const device = DevicesManager.getDeviceById(data.device_id, account.id);

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
							const service = DevicesManager.getServiceById(data.service_id, account.id);

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
			};

			if (!account) {
				handleAuthenticationError('account not found');
				return;
			}

			// Store the socket object on the account object.
			account.addClientSocket(socket);

			socket.on('disconnect', () => {
				console.info(TAG, 'Client disconnected.', socket.id);

				account.removeClientSocket(socket);
			});

			clientEndpoint('devices/get', (data, callback) => {
				if (typeof callback === 'function') {
					const accountDevices = DevicesManager.getDevicesByAccountId(account.id);

					callback(null, {devices: DevicesManager.getClientSerializedDevices(accountDevices)});
				}
			});

			clientEndpoint('device/add', (data, callback) => {
				if (DevicesManager.doesDeviceExist(data.device.id)) {
					if (typeof callback === 'function') {
						callback('A device with that ID has already been added to an account.', data);
					}

					return;
				}

				// Check to make sure the device is connected.
				if (!DevicesManager.getFromSocketEscrow(data.device.id, data.device.id)) {
					if (typeof callback === 'function') {
						callback('No device with that ID is currently connected.', data);
					}

					return;
				}

				DevicesManager.createDevice({
					...data.device,
					token: data.device.id, // All device tokens should start out the same as the ID.
					account_id: account.id
				}).then(() => {
					if (typeof callback === 'function') {
						callback(null, {});
					}
				}).catch((error) => {
					console.error(TAG, 'Add device error:', error);

					if (typeof callback === 'function') {
						callback('There was an error adding the device.', data);
					}
				});
			});

			clientEndpoint('device/remove', (data, callback) => {
				const device = data.device;

				DevicesManager.deleteDevice(device.id, account.id).then(() => {
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

			clientEndpoint('gateway/devices-to-add/get', (data, callback) => {
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

			clientEndpoint('gateway/command', (data, callback) => {
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

			clientEndpoint('camera/stream/live', function (data, callback) {
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

			clientEndpoint('camera/stream/stop', function (data, callback) {
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

			clientEndpoint('camera/recordings/get', function (data, callback) {
				const cameraService = data.service;

				if (typeof callback === 'function') {
					cameraService.getRecordings().then((recordings) => {
						callback(null, {recordings});
					}).catch((error) => {
						callback(error, data);
					});
				}
			});

			clientEndpoint('camera/recording/stream', function (data, callback) {
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

			clientEndpoint('camera/recording/stream/stop', function (data, callback) {
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

			clientEndpoint('lock/lock', function (data, callback) {
				const lockService = data.service;

				lockService.lock().then(() => {
					if (typeof callback === 'function') {
						callback(null, {});
					}
				}).catch((error) => {
					if (typeof callback === 'function') {
						callback(error, data);
					}
				});
			});

			clientEndpoint('lock/unlock', function (data, callback) {
				const lockService = data.service;

				lockService.unlock().then(() => {
					if (typeof callback === 'function') {
						callback(null, {});
					}
				}).catch((error) => {
					if (typeof callback === 'function') {
						callback(error, data);
					}
				});
			});

			clientEndpoint('lock/relock-delay/set', function (data, callback) {
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

			clientEndpoint('thermostat/temp/set', function (data, callback) {
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

			clientEndpoint('thermostat/mode/set', function (data, callback) {
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

			clientEndpoint('thermostat/hold-mode/set', function (data, callback) {
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

			clientEndpoint('thermostat/fan-mode/set', function (data, callback) {
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

			clientEndpoint('light/on', function (data, callback) {
				const lightService = data.service;

				lightService.lightOn().then(() => {
					if (typeof callback === 'function') {
						callback(null, {});
					}
				}).catch((error) => {
					if (typeof callback === 'function') {
						callback(error, data);
					}
				});
			});

			clientEndpoint('light/off', function (data, callback) {
				const lightService = data.service;

				lightService.lightOff().then(() => {
					if (typeof callback === 'function') {
						callback(null, {});
					}
				}).catch((error) => {
					if (typeof callback === 'function') {
						callback(error, data);
					}
				});
			});

			clientEndpoint('light/brightness/set', function (data, callback) {
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

			clientEndpoint('light/color/set', function (data, callback) {
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

			clientEndpoint('light/name/set', function (data, callback) {
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


			// Legacy API - DEPRECATED

			socket.on('DEPRECATED motion detected', function (data) {
				console.log('motion detected', data.toString());
				if (!motionStarted) {
					motionStarted = true;
					var mailOptions = {
						from: config.mail.from_user,
						to: config.mail.to_user,
						subject: 'Motion Detected',
						text: data.toString()
					};

					if (transporter) {
						transporter.sendMail(mailOptions, function (error, info) {
							if (error) {
								console.log(error);
							} else {
								console.log('Email sent: ' + info.response);
							}
						});
					}
				}
			});

			socket.on('DEPRECATED motion stopped', function (data) {
				console.log('motion stopped', data.toString());
				if (motionStarted) {
					motionStarted = false;
					var mailOptions = {
						from: config.mail.from_user,
						to: config.mail.to_user,
						subject: 'Motion Stopped',
						text: data.toString()
					};

					if (transporter) {
						transporter.sendMail(mailOptions, function (error, info) {
							if (error) {
								console.log(error);
							} else {
								console.log('Email sent: ' + info.response);
							}
						});
					}
				}
			});

			clientEndpoint('DEPRECATED get contacts', function (data) {
				var group_index = find_index(groups, 'group_id', data.user_token);
				socket.emit('get contacts', groups[group_index]);
				//console.log('get contacts',data);
			});

			clientEndpoint('DEPRECATED add contact', function (data) {
				var group_index = find_index(groups, 'group_id', data.user_token);
				groups[group_index].contacts.push({ label: data.label, number: data.number });
				database.store_group(groups[group_index]);
				socket.emit('add contact', data);
			});

			clientEndpoint('DEPRECATED remove contact', function (data) {
				var group_index = find_index(groups, 'group_id', data.user_token);
				var user_index = groups[group_index].contacts.indexOf(data.user);
				for (var i = 0; i < groups[group_index].contacts.length; i++) {
					if (groups[group_index].contacts[i].label === data.user.label) {
						user_index = i;
					}
				}
				groups[group_index].contacts.splice(user_index, 1);
				database.store_group(groups[group_index]);
				socket.emit('remove contact', data);
			});
		});
	});
};
