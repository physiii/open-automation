const Service = require('./service.js');

class MediaService extends Service {
	action (data) {
		switch (data.property) {
			case 'setClickCoords':
				return this.setClickCoords(data.value);
			case 'setCoords':
				return this.setCoords(data.value);
			case 'setLevel':
				return this.setLevel(data.value);
			case 'mute':
				return this.mute(data.value);
			case 'pause':
				return this.pause(data.value);
			case 'prev':
				return this.prev(data.value);
			case 'next':
				return this.next(data.value);
		}
	}

	setLevel (level) {
		return new Promise((resolve, reject) => {
			this.deviceEmit('level/set', {level}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}

	mute (level) {
		return new Promise((resolve, reject) => {
			this.deviceEmit('mute', {level}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}

	pause (level) {
		return new Promise((resolve, reject) => {
			this.deviceEmit('pause', {level}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}

	prev (level) {
		return new Promise((resolve, reject) => {
			this.deviceEmit('prev', {level}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}

	next (level) {
		return new Promise((resolve, reject) => {
			this.deviceEmit('next', {level}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}

	setClickCoords (coords) {
		return new Promise((resolve, reject) => {
			this.deviceEmit('click/set', {coords}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}

	setCoords (coords) {
		return new Promise((resolve, reject) => {
			this.deviceEmit('coords/set', {coords}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}
}

MediaService.type = 'media';
MediaService.friendly_type = 'Media';
MediaService.indefinite_article = 'A';
MediaService.state_definitions = new Map()
	.set('power', {
		type: 'boolean',
		setter: 'setPower'
	})
	.set('brightness', {
		type: 'percentage',
		setter: 'setBrightness'
	})
	.set('color', {
		type: 'color',
		setter: 'setColor'
	});

module.exports = MediaService;
