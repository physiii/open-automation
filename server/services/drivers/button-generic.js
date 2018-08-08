const GatewayServiceDriver = require('./gateway.js');

class GenericButtonDriver extends GatewayServiceDriver {
	constructor (button_id, gateway_socket) {
		super(button_id, 'button', gateway_socket);
	}

	listenToSocket () {}
}

module.exports = GenericButtonDriver;
