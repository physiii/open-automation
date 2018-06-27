const Service = require('./service.js'),
	TAG = '[LightService]';

class LightService extends Service {
	constructor (data, onUpdate, driverClass) {
		super(data, onUpdate);

		this.type = 'light';

		//this.setSettings(data.settings || {});

		this.driver = new driverClass(this.id);
		this.subscribeToDriver();
	}

	subscribeToDriver () {}

	lightOn () {
		return this.driver.lightOn();
	};

	lightOff () {
		return this.driver.lightOff();
	};

	setBrightness (brightness) {
		return this.driver.setBrightness(brightness);
	};

	setColor (color) {
		return this.driver.setColor(color);
	};

	setLightName (name) {
		return this.driver.setLightName(name);
	}

	serialize () {
		return {
			...Service.prototype.serialize.apply(this, arguments)
		};
	}

	dbSerialize () {
		return this.serialize();
	}
}

module.exports = LightService;
