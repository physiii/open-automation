const Service = require('./service.js');

class ServicesManager {
	constructor (device, services = [], deviceOn, deviceEmit, onServiceUpdate, saveService) {
		this.device = device;
		this.deviceOn = deviceOn;
		this.deviceEmit = deviceEmit;
		this.onServiceUpdate = onServiceUpdate;
		this.saveService = saveService;
		this.services = [];

		this.updateServices(services);
	}

	addService (data, should_update_existing = false) {
		const service_class = ServicesManager.classes[data.type] || Service;
		let service = this.getServiceById(data.id);

		if (service) {
			if (!should_update_existing) {
				return service;
			}

			service.update(data);

			return service;
		}

		// Create the service instance.
		service = new service_class(
			{...data, device: this.device},
			this.onServiceUpdate,
			this.deviceOn,
			this.deviceEmit,
			this.saveService
		);

		this.services.push(service);

		return service;
	}

	updateServices (services) {
		if (!services || !services.forEach) {
			console.error(TAG, '[updateServices] Services must be an array or map.');
			return;
		}

		services.forEach((service) => {
			this.addService(service, true);
		});
	}

	getServiceById (serviceId) {
		return this.services.find((service) => service.id === serviceId);
	}

	getSerializedServices () {
		return this.services.map((service) => service.serialize());
	}

	getDbSerializedServices () {
		return this.services.map((service) => service.dbSerialize());
	}

	getClientSerializedServices () {
		return this.services.map((service) => service.clientSerialize());
	}

	destroy () {
		this.services.forEach((service) => service.destroy());
	}
}

ServicesManager.classes = {
	'bill-acceptor': require('./bill-acceptor-service.js'),
	'button': require('./button-service.js'),
	'camera': require('./camera-service.js'),
	'contact-sensor': require('./contact-sensor-service.js'),
	'dimmer': require('./dimmer-service.js'),
	'event-mock': require('./event-mock-service.js'),
	'game-machine': require('./game-machine-service.js'),
	'gateway': require('./gateway-service.js'),
	'light': require('./light-service.js'),
	'lock': require('./lock-service.js'),
	'siren': require('./siren-service.js'),
	'thermostat': require('./thermostat-service.js')
};

module.exports = ServicesManager;
