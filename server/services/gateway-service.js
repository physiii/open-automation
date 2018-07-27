const crypto = require('crypto'),
	Service = require('./service.js'),
	GatewayServiceDriver = require('./drivers/gateway.js'),
	COMMAND_TOKEN_SIZE = 8,
	TAG = '[GatewayService]';

class GatewayService extends Service {
	constructor (data, onUpdate, gateway_socket) {
		super(data, onUpdate);

		this.type = 'gateway';

		this.driver = new GatewayServiceDriver(this.id, 'gateway', gateway_socket);
	}

	getDevices () {
		return this.driver.getDevices();
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
		return this.driver.command(command);
	}

	clientSerialize () {
		return {
			...Service.prototype.clientSerialize.apply(this, arguments)
		};
	}
}

module.exports = GatewayService;
