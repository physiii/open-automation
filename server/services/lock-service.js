const Service = require('./service.js'),
	GatewayLockDriver = require('./drivers/lock-gateway.js'),
	TAG = '[LockService]';

class LockService extends Service {
	constructor (data, onUpdate, gateway_socket) {
		super(data, onUpdate);

		this.driver = new GatewayLockDriver(this.id, gateway_socket);
		this.subscribeToDriver();
	}

	subscribeToDriver () {}

	lock () {
		return this.driver.lock();
	}

	unlock () {
		return this.driver.unlock();
	}

	setRelockDelay (delay) {
		return this.driver.setRelockDelay(delay);
	}

	serialize () {
		return {
			...Service.prototype.serialize.apply(this, arguments),
			zwave_node_id: this.zwave_node_id
		};
	}

	dbSerialize () {
		return this.serialize();
	}
}

LockService.type = 'lock';
LockService.friendly_type = 'Lock';
LockService.indefinite_article = 'A';

module.exports = LockService;
