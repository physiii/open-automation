const Service = require('./service.js'),
	TAG = '[LockService]';

class LockService extends Service {
	constructor (data, onUpdate, deviceOn, deviceEmit) {
		super(data, onUpdate, deviceOn, deviceEmit);

		this.subscribeToDriver();

		this.lock = this.lock.bind(this);
		this.unlock = this.unlock.bind(this);
	}

	subscribeToDriver () {
		this.deviceOn('state update', (state) => this.setState(state));
	}

	lock () {
		return new Promise((resolve, reject) => {
			this.deviceEmit('lock/set', {}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}

	unlock () {
		return new Promise((resolve, reject) => {
			this.deviceEmit('unlock/set', {}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}

	setRelockDelay (delay) {
		return new Promise((resolve, reject) => {
			this.deviceEmit('relockDelay/set', {relock_delay: delay}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
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
