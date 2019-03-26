const Service = require('./service.js'),
	validateUuid = require('uuid-validate'),
	is_production = process.env.NODE_ENV === 'production',
	noOp = () => {},
	TAG = '[ServicesManager]';

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

	addService (data = {}, should_update_existing = false, callback = noOp) {
		if (!this.isServiceIdValid(data.id)) {
			const consoleLog = is_production ? console.error : console.warn,
				error_message = 'Service ID must be a valid UUID v4 or v1. ID provided: ' + data.id;

			consoleLog(TAG, error_message);

			if (is_production) {
				callback(error_message);
				return;
			} else {
				consoleLog(TAG, 'The provided ID will not work in production.');
			}
		}

		const service_class = ServicesManager.classes[data.type] || Service;
		let service = this.getServiceById(data.id);

		if (service) {
			if (!should_update_existing) {
				callback(null, service);
				return service;
			}

			service.update(data);

			callback(null, service);
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

		callback(null, service);
		return service;
	}

	updateServices (services, callback = noOp) {
		if (!services || !services.forEach) {
			console.error(TAG, '[updateServices] Services must be an array or map.');
			callback('The services data provided was not valid.');
			return;
		}

		const service_errors = [];

		services.forEach((service) => {
			this.addService(service, true, (error) => {
				if (error) {
					service_errors.push('(' + service.id + ') ' + error);
				}
			});
		});

		if (service_errors.length > 0) {
			callback('The services may not have all been added due to the following errors: \n' + service_errors.join(' \n'));
		} else {
			callback();
		}
	}

	isServiceIdValid (id) {
		return validateUuid(id, 1) || validateUuid(id, 4);
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
