// ------------------------------  OPEN-AUTOMATION ----------------------------------- //
// -----------------  https://github.com/physiii/open-automation  -------------------- //
// ---------------------------------- socket.js -------------------------------------- //

const database = require('./database.js'),
	AccountsManager = require('./accounts/accounts-manager.js'),
	DevicesManager = require('./devices/devices-manager.js'),
	utils = require('./utils.js'),
	find_index = utils.find_index,
	config = require('../config.json'),
	io = require('socket.io'),
	crypto = require('crypto'),
	jwt = require('jsonwebtoken'),
	cookie = require('cookie'),
	nodemailer = require('nodemailer'),
	smtpTransport = require('nodemailer-smtp-transport'),
	TAG = '[socket.js]';

let motionStarted = false;

module.exports = {
	start: start
};

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

function start (server, jwt_secret) {
	io.listen(server).on('connection', (socket) => {
		const cookies = cookie.parse(socket.handshake.headers.cookie);

		console.info(TAG, 'Client connected.', socket.id);

		// TODO: Allow passing access_token through query params for non-browser clients (e.g. gateway devices).
		if (!cookies.access_token) {
			handleAuthenticationError('no access token');
			return;
		}

		function handleAuthenticationError (error) {
			console.log(TAG, 'Closing socket connection due to authentication error (' + error + ').', socket.id);

			socket.emit('session', {error: error || true});

			// Closing socket connection on authentication error because the
			// client must reconnect for socket server to get latest cookies.
			socket.disconnect();
		}

		function verifyAccessToken (callback) {
			jwt.verify(cookies.access_token, jwt_secret, {issuer: config.api_token_issuer}, (error, claims) => {
				if (error) {
					handleAuthenticationError('invalid access token ' + error.name);
					return;
				}

				callback(claims.sub, claims.xsrf_token);
			});
		}

		function endpoint (event, callback) {
			socket.on(event, (data, clientCallback) => {
				// Verify access token at each API request. This ensures that
				// the API will stop responding when the access token expires.
				verifyAccessToken((account_id, xsrf_token) => {
					// Verify CSRF token.
					if (data.xsrf_token !== xsrf_token) {
						console.log(TAG, 'Rejecting API request due to incorrect XSRF token.', socket.id);

						if (typeof clientCallback === 'function') {
							clientCallback('authentication');
						}

						handleAuthenticationError('incorrect XSRF token');
						return;
					}

					callback(data, clientCallback);
				});
			});
		}

		// Verify access token at initial API socket connection.
		verifyAccessToken((account_id) => {
			const account = AccountsManager.getAccountById(account_id);

			// Store the socket object on the account object.
			if (account) {
				account.client_socket = socket;
			}

			socket.on('disconnect', () => {
				console.info(TAG, 'Client disconnected.', socket.id);

				if (account) {
					delete account.client_socket;
				}
			});

			// Gateway API

			// Gateway device connection
			socket.on('gateway/device/connect', (data, callback) => {
				const device = DevicesManager.getDeviceById(data.device_id);

				// If the device doesn't exist, store the socket in escrow to be used
				// when the device is added.
				if (!device) {
					DevicesManager.addToSocketEscrow(data.device_id, socket);

					if (typeof callback === 'function') {
						callback(null, {});
					}

					return;
				}

				// TODO: Add some sort of authentication so we know this is really the device it claims to be.

				// Update the socket on the device.
				device.setGatewaySocket(socket);

				if (typeof callback === 'function') {
					callback(null, {});
				}
			});


			// Client API

			endpoint('devices/get', (data, callback) => {
				if (typeof callback === 'function') {
					const locationDevices = DevicesManager.getDevicesByLocation(account._id);

					callback(null, {devices: DevicesManager.getClientSerializedDevices(locationDevices)});
				}
			});

			// Camera Service API

			endpoint('camera/stream/live', function (data, callback) {
				const cameraService = DevicesManager.getServiceById(data.service_id);

				// TODO: Confirm user has access to this service. If not, callback with service-not-found error.

				if (!cameraService) {
					if (typeof callback === 'function') {
						callback('Service not found.', data);
					}

					return;
				}

				cameraService.streamLive().then((stream_token) => {
					if (typeof callback === 'function') {
						callback(null, {stream_token});
					}
				}).catch((error) => {
					if (typeof callback === 'function') {
						callback(error, data);
					}
				});
			});

			endpoint('camera/stream/stop', function (data, callback) {
				const cameraService = DevicesManager.getServiceById(data.service_id);

				// TODO: Confirm user has access to this service. If not, callback with service-not-found error.

				if (!cameraService) {
					if (typeof callback === 'function') {
						callback('Service not found.', data);
					}

					return;
				}

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

			endpoint('camera/recordings/get', function (data, callback) {
				if (typeof callback === 'function') {
					const cameraService = DevicesManager.getServiceById(data.service_id);

					// TODO: Confirm user has access to this service. If not, callback with service-not-found error.

					if (!cameraService) {
						console.log('Service not found.', data);
						callback('Service not found.', data);
						return;
					}

					cameraService.getRecordings().then((recordings) => {
						callback(null, {recordings});
					}).catch((error) => {
						callback(error, data);
					});
				}
			});

			endpoint('camera/recording/stream', function (data, callback) {
				const cameraService = DevicesManager.getServiceById(data.service_id);

				// TODO: Confirm user has access to this service. If not, callback with service-not-found error.

				if (!cameraService) {
					if (typeof callback === 'function') {
						callback('Service not found.', data);
					}

					return;
				}

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

			endpoint('camera/recording/stream/stop', function (data, callback) {
				const cameraService = DevicesManager.getServiceById(data.service_id);

				// TODO: Confirm user has access to this service. If not, callback with service-not-found error.

				if (!cameraService) {
					if (typeof callback === 'function') {
						callback('Service not found.', data);
					}

					return;
				}

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


			// Legacy API - DEPRECATED

			endpoint('motion detected', function (data) {
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

			endpoint('motion stopped', function (data) {
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

			endpoint('get contacts', function (data) {
				var group_index = find_index(groups, 'group_id', data.user_token);
				socket.emit('get contacts', groups[group_index]);
				//console.log('get contacts',data);
			});

			endpoint('add contact', function (data) {
				var group_index = find_index(groups, 'group_id', data.user_token);
				groups[group_index].contacts.push({ label: data.label, number: data.number });
				database.store_group(groups[group_index]);
				socket.emit('add contact', data);
			});

			endpoint('remove contact', function (data) {
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
}
