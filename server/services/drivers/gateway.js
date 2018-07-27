const EventEmitter = require('events');

class GatewayServiceDriver {
	constructor (service_id, event_namespace, gateway_socket) {
		this.event_prefix = event_namespace + '/' + service_id;
		this.events = new EventEmitter();

		if (gateway_socket) {
			this.gateway_socket = gateway_socket;
			this.listenToGateway();
		}
	}

	on () {
		return this.events.on.apply(this.events, arguments);
	}

	listenToGateway () {
		this.gatewayOn('state', (data) => this.events.emit('state update', data.state));
	}

	gatewayOn (event, callback) {
		this.gateway_socket.on(this.event_prefix + '/' + event, callback);
	}

	gatewayEmit (event, data, callback) {
		this.gateway_socket.emit(this.event_prefix + '/' + event, data, callback);
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
