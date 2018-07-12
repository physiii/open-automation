const Service = require('./service.js'),
	GatewayService = require('./gateway-service.js'),
	CameraService = require('./camera-service.js'),
	LockService = require('./lock-service.js'),
	ThermostatService = require('./thermostat-service.js'),
	LightService = require('./light-service.js'),
	EventMockService = require('./event-mock-service.js'),
	GatewayServiceDriver = require('./drivers/gateway.js'),
	GatewayCameraDriver = require('./drivers/camera-gateway.js'),
	GatewayLockDriver = require('./drivers/lock-gateway.js'),
	GatewayThermostatDriver = require('./drivers/thermostat-gateway.js'),
	GatewayLightDriver = require('./drivers/light-gateway.js');

class ServicesManager {
	constructor (services = [], device, onServiceUpdate) {
		this.device = device;
		this.services = [];

		this.onServiceUpdate = onServiceUpdate;

		this.updateServices(services);
	}

	addService (data, gatewaySocket) {
		let service = this.getServiceById(data.id);

		if (service) {
			if (data.state) {
				service.setState(data.state);
			}

			return service;
		}

		switch (data.type) {
			case 'camera':
				service = new CameraService(data, this.onServiceUpdate, GatewayCameraDriver);
				break;
			case 'gateway':
				service = new GatewayService(data, this.onServiceUpdate, GatewayServiceDriver);
				break;
			case 'lock':
				service = new LockService(data, this.onServiceUpdate, GatewayLockDriver);
				break;
			case 'thermostat':
				service = new ThermostatService(data, this.onServiceUpdate, GatewayThermostatDriver);
				break;
			case 'light':
				service = new LightService(data, this.onServiceUpdate, GatewayLightDriver);
				break;
			case 'event-mock':
				service = new EventMockService(data, this.onServiceUpdate);
				break;
			default:
				service = new Service(data, this.onServiceUpdate);
				break;
		}

		// If the service is using a gateway driver, pass the gateway socket to
		// the driver.
		if (gatewaySocket && service.driver && service.driver.setGatewaySocket) {
			service.driver.setGatewaySocket(gatewaySocket);
		}

		service.device = this.device;
		this.services.push(service);

		return service;
	}

	updateServices (services, gatewaySocket) {
		if (!services || !services.forEach) {
			console.error(TAG, '[updateServices] Services must be an array or map.');
			return;
		}

		services.forEach((service) => {
			this.addService(service, gatewaySocket);
		});
	}

	setGatewaySocket (socket) {
		this.services.forEach((service) => {
			if (service.driver && service.driver.setGatewaySocket) {
				service.driver.setGatewaySocket(socket);
			}
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
