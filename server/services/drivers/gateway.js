const EventEmitter = require('events');

class GatewayServiceDriver {
	constructor (serviceId, eventNamespace, gatewaySocket) {
		this.eventPrefix = eventNamespace + '/' + serviceId;
		this.events = new EventEmitter();

		if (gatewaySocket) {
			this.setGatewaySocket(gatewaySocket);
		}
	}

	on () {
		return this.events.on.apply(this.events, arguments);
	}

	listenToGateway () {
		this.gatewayOn('state', (data) => this.events.emit('state update', data.state));
	}

	setGatewaySocket (gatewaySocket) {
		this.gatewaySocket = gatewaySocket;
		this.listenToGateway();
	}

	gatewayOn (event, callback) {
		this.gatewaySocket.on(this.eventPrefix + '/' + event, callback);
	}

	gatewayEmit (event, data, callback) {
		this.gatewaySocket.emit(this.eventPrefix + '/' + event, data, callback);
	}

	getDevices (command) {
		return new Promise((resolve, reject) => {
			this.gatewayEmit('devices/get', {}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve(data);
			});
		});
	}

	command (command) {
		return new Promise((resolve, reject) => {
			this.gatewayEmit('command', {command}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve(data);
			});
		});
	}
}

module.exports = GatewayServiceDriver;
