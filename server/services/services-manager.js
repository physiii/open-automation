const Service = require('./service.js'),
	CameraService = require('./camera-service.js'),
	GatewayCameraDriver = require('./drivers/camera-gateway.js');

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
