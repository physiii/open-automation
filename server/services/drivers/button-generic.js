const GatewayServiceDriver = require('./gateway.js');

class GernericButtonDriver extends GatewayServiceDriver {
	constructor (button_id, gateway_socket) {
		super(button_id, 'button', gateway_socket);
	}

	listenToSocket () {}
}
