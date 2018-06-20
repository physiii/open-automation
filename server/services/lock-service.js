const Service = require('./service.js'),
	TAG = '[LockService]';

class LockService extends Service {
	constructor (data, driverClass) {
		super(data);

		this.type = 'lock';

		this.driver = new driverClass(this.id);
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

module.exports = LockService;
