const Service = require('./service.js'),
	TAG = '[LockService]';

class LockService extends Service {
	constructor (data, onUpdate, deviceOn, deviceEmit, save) {
		super(data, onUpdate, deviceOn, deviceEmit, save);

		this.lock = this.lock.bind(this);
		this.unlock = this.unlock.bind(this);
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
}

LockService.type = 'lock';
LockService.friendly_type = 'Lock';
LockService.indefinite_article = 'A';

module.exports = LockService;
