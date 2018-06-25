const Service = require('./service.js'),
	TAG = '[LightService]';

class LightService extends Service {
	constructor (data, driverClass) {
		super(data);

		this.type = 'light';

		//this.setSettings(data.settings || {});

		this.driver = new driverClass(this.id);
		this.subscribeToDriver();
	}

	subscribeToDriver () {}

  lightOn () {
    return this.driver.setLightOn();
  };

  lightOff () {
    return this.driver.setLightOff();
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
			...Service.prototype.serialize.apply(this, arguments),
			id: this.id
		};
	}

	dbSerialize () {
		return this.serialize();
	}
}

module.exports = LightService;
