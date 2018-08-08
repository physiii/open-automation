const GatewayServiceDriver = require('./gateway.js'),
	BUTTON = {
		0: 'release',
		1: 'center',
		2: 'top-right',
		3: 'bottom-right',
		4: 'bottom-left',
		5: 'top-left',
		6: 'top',
		7: 'right',
		8: 'down',
		9: 'left',
	};

class GenericButtonDriver extends GatewayServiceDriver {
	constructor (button_id, gateway_socket) {
		super(button_id, 'button', gateway_socket);
	}

	listenToSocket () {
		GatewayServiceDriver.prototype.listenToGateway.apply(this, arguments);

		this.gatewayOn('button pressed', (event_data) => this.events.emit('pressed/' + BUTTON[event_data.value]));
	}
}

module.exports = GenericButtonDriver;
