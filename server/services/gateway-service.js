const crypto = require('crypto'),
	Service = require('./service.js'),
	COMMAND_TOKEN_SIZE = 8,
	TAG = '[GatewayService]';

class GatewayService extends Service {
	getDevices () {
		return new Promise((resolve, reject) => {
			this.deviceEmit('devices/get', {}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve(data);
			});
		});
	}

	getCommandToken () {
		return new Promise((resolve, reject) => {
			crypto.randomBytes(COMMAND_TOKEN_SIZE, (error, token_buffer) => {
				if (error) {
					reject(error);
					return;
				}

				const token = token_buffer.toString('hex');

				this.command_token = token;

				console.log(TAG, this.id, 'command token', token);

				// NOTE: DO NOT SEND THE TOKEN TO CLIENT.
				resolve();
			});
		});
	}

	verifyCommandToken (token) {
		return token && token === this.command_token;
	}

	command (command) {
		return new Promise((resolve, reject) => {
			this.deviceEmit('command', {command}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve(data);
			});
		});
	}
}

GatewayService.type = 'gateway';
GatewayService.friendly_type = 'Gateway';
GatewayService.indefinite_article = 'A';

module.exports = GatewayService;
