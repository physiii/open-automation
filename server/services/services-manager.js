const Service = require('./service.js'),
	service_classes = {
		'gateway': require('./gateway-service.js'),
		'camera': require('./camera-service.js'),
		'lock': require('./lock-service.js'),
		'thermostat': require('./thermostat-service.js'),
		'light': require('./light-service.js')
	};

class ServicesManager {
	constructor (services = [], gateway_socket, device, onServiceUpdate) {
		this.gateway_socket = gateway_socket;
		this.device = device;
		this.services = [];

		this.onServiceUpdate = onServiceUpdate;

		this.updateServices(services);
	}

	addService (data) {
		const service_class = service_classes[data.type] || Service;
		let service = this.getServiceById(data.id);

		if (service) {
			if (data.state) {
				service.setState(data.state);
			}

			return service;
		}

		// Create the service instance.
		service = new service_class(
			{...data, device: this.device},
			this.onServiceUpdate,
			this.gateway_socket
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
			this.addService(service);
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
}

module.exports = ServicesManager;
